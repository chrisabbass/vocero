import { supabase } from "@/integrations/supabase/client";

export const generateVariations = async (text: string, personality: string = 'friendly'): Promise<string[]> => {
  try {
    console.log('Starting variation generation with text:', text);
    console.log('Using personality:', personality);
    
    const { data: apiKey, error: keyError } = await supabase.rpc('get_secret', {
      name: 'ANTHROPIC_API_KEY'
    });

    if (keyError) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Failed to fetch API key from Supabase');
    }

    if (!apiKey) {
      console.error('No API key found in Supabase secrets');
      throw new Error('Anthropic API key is not set in Supabase secrets');
    }

    console.log('API key retrieved successfully');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
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

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (!data.content?.[0]?.text) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from API');
    }

    const variations = data.content[0].text
      .split('\n')
      .filter((v: string) => v.trim().length > 0)
      .map((v: string) => v.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    console.log('Generated variations:', variations);
    return variations;
  } catch (error) {
    console.error('Error in generateVariations:', error);
    throw error;
  }
};

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