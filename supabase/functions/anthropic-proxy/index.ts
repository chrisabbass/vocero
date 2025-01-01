import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify environment setup
function verifyEnvironment() {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  console.log('Checking for ANTHROPIC_API_KEY:', ANTHROPIC_API_KEY ? 'Present' : 'Missing');
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Configuration error: Missing API key');
  }
  return ANTHROPIC_API_KEY;
}

// Helper function to create variations
async function createVariations(messages: any[], systemPrompt: string) {
  const ANTHROPIC_API_KEY = verifyEnvironment();
  
  console.log('Creating variations with system prompt:', systemPrompt);
  console.log('Messages:', JSON.stringify(messages));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.filter((msg: any) => msg.role !== 'system'),
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Anthropic API error: ${JSON.stringify(errorJson)}`);
      } catch {
        throw new Error(`Anthropic API error: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Successfully received response:', data);
    return data;
  } catch (error) {
    console.error('Error in createVariations:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Verify environment before processing request
    verifyEnvironment();

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { messages, systemPrompt } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create variations
    const response = await createVariations(messages, systemPrompt);

    return new Response(
      JSON.stringify(response), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in edge function:', error);

    // Format user-friendly error message
    let errorMessage = 'Failed to generate variations. ';
    if (error.message?.includes('rate_limit_error')) {
      errorMessage += 'The service is experiencing high demand. Please try again in a few moments.';
    } else if (error.message?.includes('Input text too long')) {
      errorMessage += 'Please record a shorter message (maximum 30 seconds recommended).';
    } else if (error.message?.includes('Configuration error')) {
      errorMessage += 'There is a configuration issue. Please contact support.';
    } else {
      errorMessage += 'An unexpected error occurred. Please try again.';
    }

    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});