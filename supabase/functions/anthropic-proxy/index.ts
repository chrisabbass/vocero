import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify environment setup
function verifyEnvironment() {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  if (!ANTHROPIC_API_KEY) {
    console.error('Critical configuration error: ANTHROPIC_API_KEY is not set');
    throw new Error('Configuration error: Missing API key');
  }
  return ANTHROPIC_API_KEY;
}

// Helper function to create variations with retry logic
async function createVariations(messages: any[], systemPrompt: string) {
  const ANTHROPIC_API_KEY = verifyEnvironment();
  
  console.log('Creating variations with system prompt:', systemPrompt);
  console.log('Messages:', JSON.stringify(messages));
  
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
    const error = await response.json();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  console.log('Successfully received response:', data);
  return data;
}

// Exponential backoff retry logic with jitter
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // Last attempt failed, propagate error
      }
      
      if (error.message?.includes('rate_limit_error')) {
        const baseDelay = Math.pow(2, i) * 1000; // Base delay: 1s, 2s, 4s
        const jitter = Math.random() * 1000; // Add up to 1s of random jitter
        const delay = baseDelay + jitter;
        
        console.log(`Rate limited, retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify environment before processing request
    verifyEnvironment();

    const { messages, systemPrompt } = await req.json();
    console.log('Processing request with message count:', messages.length);
    
    // Estimate token count (rough estimation)
    const totalText = messages.reduce((acc: string, msg: any) => acc + msg.content, '') + systemPrompt;
    const estimatedTokens = Math.ceil(totalText.length / 4); // rough estimate
    console.log('Estimated input tokens:', estimatedTokens);
    
    if (estimatedTokens > 2000) {
      throw new Error('Input text too long');
    }

    // Attempt to create variations with retry logic
    const response = await retryWithBackoff(() => createVariations(messages, systemPrompt));
    console.log('Successfully received response from Anthropic');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

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

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});