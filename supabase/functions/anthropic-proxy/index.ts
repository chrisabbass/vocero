import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Anthropic proxy function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, personality } = await req.json();
    console.log('Received request with transcript:', transcript);
    console.log('Personality:', personality);

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    let systemPrompt = 'You are a professional content writer creating engaging social media posts.';
    switch (personality) {
      case 'direct':
        systemPrompt = 'You are a professional content writer focused on creating clear, concise, and straightforward social media posts. Keep the tone direct and business-like.';
        break;
      case 'friendly':
        systemPrompt = 'You are a warm and approachable content writer creating engaging and relatable social media posts. Use a conversational and friendly tone.';
        break;
      case 'enthusiastic':
        systemPrompt = 'You are an energetic content writer creating exciting and dynamic social media posts. Use an upbeat and enthusiastic tone with appropriate exclamation marks!';
        break;
    }

    console.log('Using system prompt:', systemPrompt);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Create 3 variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.): ${transcript}`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Anthropic:', data);

    // Extract variations from the response
    const content = data.content[0].text;
    const variations = content
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((v: string) => v.replace(/^\d+\.\s*/, '').trim());

    console.log('Extracted variations:', variations);

    return new Response(
      JSON.stringify({ variations }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in anthropic-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});