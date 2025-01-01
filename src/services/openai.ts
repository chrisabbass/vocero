import { supabase } from "@/integrations/supabase/client";

const getPersonalityPrompt = (personality: string) => {
  switch (personality) {
    case 'direct':
      return 'You are a professional content writer who creates clear, concise, and straightforward social media posts.';
    case 'friendly':
      return 'You are a warm and approachable content writer who creates engaging and relatable social media posts.';
    case 'enthusiastic':
      return 'You are an energetic content writer who creates exciting and dynamic social media posts with lots of personality!';
    default:
      return 'You are a professional content writer who creates engaging social media posts.';
  }
};

export const generateVariations = async (text: string, personality: string = 'friendly'): Promise<string[]> => {
  try {
    console.log('Starting variation generation process...');
    console.log('Fetching Anthropic API key from Supabase...');

    // Fetch the API key from Supabase
    const { data: apiKey, error: keyError } = await supabase.rpc('get_secret', {
      name: 'ANTHROPIC_API_KEY'
    });

    if (keyError) {
      console.error('Error fetching Anthropic API key:', keyError);
      throw new Error('Failed to fetch Anthropic API key');
    }

    if (!apiKey) {
      console.error('Anthropic API key is not set in Supabase secrets');
      throw new Error('Anthropic API key is not set');
    }

    console.log('API key retrieved successfully');
    console.log('Making request to Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `${getPersonalityPrompt(personality)}\n\nCreate 3 variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.): ${text}`
        }]
      })
    });

    console.log('Anthropic API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API Error:', errorData);
      throw new Error(`Anthropic API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log('Anthropic API Response:', responseData);

    if (!responseData.content?.[0]?.text) {
      console.error('Unexpected Anthropic response format:', responseData);
      throw new Error('Invalid response format from Anthropic');
    }

    const variations = responseData.content[0].text
      .split('\n')
      .filter((v: string) => v.trim().length > 0)
      .map((v: string) => v.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);
    
    console.log('Generated variations:', variations);

    if (variations.length === 0) {
      throw new Error('No variations were generated');
    }

    return variations;
  } catch (error) {
    console.error('Error in generateVariations:', error);
    throw error;
  }
};