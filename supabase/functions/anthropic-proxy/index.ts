import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      
      // If it's a rate limit error, wait longer
      const isRateLimit = error.message?.includes('rate_limit_error');
      const delay = isRateLimit ? initialDelay * Math.pow(2, retries) : initialDelay;
      
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms delay`);
      await sleep(delay);
    }
  }
}

serve(async (req) => {
  console.log('Anthropic proxy function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { transcript, personality } = requestBody;
    
    if (!transcript) {
      console.error('No transcript provided in request');
      throw new Error('No transcript provided');
    }

    console.log('Processing request with:', { transcript, personality });

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    let systemPrompt = '';
    switch (personality) {
      case 'direct':
        systemPrompt = 'You are an intelligent, entrepreneurial, and data-forward content writer focused on creating clear, concise, and straightforward social media posts. You are known for your direct but highly informative and impactful posts. Your style is less noise and more signal.';
        break;
      case 'friendly':
        systemPrompt = 'You are a warm, approachable content writer creating engaging and relatable social media posts. Use a conversational and friendly tone but don\'t go overboard. Your writing is still professional and business-leaning but with a more warm and friendly tone. Always use 2-3 relevant emojis in each post.';
        break;
      case 'inspiring':
        systemPrompt = 'You are an energetic and motivational content writer creating exciting and dynamic social media posts that inspire those who read them. Use an upbeat and enthusiastic tone that uplifts and inspires the audience! Your style is TedX motivational speaker meets social media influencer.';
        break;
      default:
        systemPrompt = 'You are a professional content writer creating engaging social media posts with a balanced tone.';
    }

    console.log('Using system prompt:', systemPrompt);

    const generateVariations = async () => {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500, // Reduced from 1024 to help with rate limiting
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Create exactly 3 short but impactful variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.). Keep each variation under 280 characters. Here's the text: ${transcript}`
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
      }

      return response.json();
    };

    // Use retry logic for the API call
    const data = await retryWithBackoff(generateVariations);
    console.log('Received response from Anthropic:', data);

    // Extract exactly 3 variations from the response
    const content = data.content[0].text;
    const variations = content
      .split(/\d+\.\s+/)  // Split on numbered variations
      .filter(Boolean)    // Remove empty strings
      .slice(0, 3)       // Ensure exactly 3 variations
      .map(v => v.trim());

    console.log('Extracted variations:', variations);

    if (variations.length !== 3) {
      throw new Error('Failed to generate exactly 3 variations');
    }

    return new Response(
      JSON.stringify({ variations }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in anthropic-proxy function:', error);
    
    // Determine if it's a rate limit error
    const isRateLimit = error.message?.includes('rate_limit_error');
    const statusCode = isRateLimit ? 429 : 500;
    const errorMessage = isRateLimit 
      ? 'Rate limit exceeded. Please try again in a few moments.'
      : 'Failed to generate variations. Please try again.';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.stack 
      }), 
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});