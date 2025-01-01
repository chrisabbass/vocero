import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Exponential backoff retry logic with delay between retries
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('rate_limit_error')) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Add jitter
        console.log(`Rate limited, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    const { messages, systemPrompt } = await req.json()
    console.log('Processing request with message count:', messages.length)
    
    // Estimate token count (rough estimation)
    const totalText = messages.reduce((acc: string, msg: any) => acc + msg.content, '') + systemPrompt;
    const estimatedTokens = Math.ceil(totalText.length / 4); // rough estimate
    console.log('Estimated input tokens:', estimatedTokens);
    
    if (estimatedTokens > 2000) { // Reduced from 4000 to stay well within limits
      throw new Error('Input text too long, please reduce length');
    }

    const response = await retryWithBackoff(async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 512, // Reduced from 1024 to help with rate limits
          system: systemPrompt,
          messages: messages.filter((msg: any) => msg.role !== 'system'),
          temperature: 0.7
        })
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Anthropic API error:', error);
        throw new Error(`Anthropic API error: ${error}`);
      }

      return res.json();
    });

    console.log('Successfully received response from Anthropic');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in anthropic-proxy function:', error);
    
    // Format user-friendly error message
    let errorMessage = 'Failed to generate variations. ';
    if (error.message?.includes('rate_limit_error')) {
      errorMessage += 'The service is experiencing high demand. Please try again in a few moments.';
    } else if (error.message?.includes('Input text too long')) {
      errorMessage += 'Please record a shorter message (maximum 30 seconds recommended).';
    } else {
      errorMessage += 'An unexpected error occurred. Please try again.';
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})