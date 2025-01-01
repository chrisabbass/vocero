import { supabase } from "@/integrations/supabase/client";

export const generateVariations = async (text: string, personality: string = 'friendly'): Promise<string[]> => {
  try {
    console.log('Starting variation generation process...');
    console.log('Input text:', text);
    console.log('Selected personality:', personality);
    
    // Fetch API key with improved error handling
    const { data: apiKey, error: keyError } = await supabase.rpc('get_secret', {
      name: 'ANTHROPIC_API_KEY'
    });

    if (keyError) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Failed to fetch Anthropic API key from Supabase');
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error('Invalid or missing API key');
      throw new Error('Please set up your Anthropic API key in Supabase secrets');
    }

    console.log('API key retrieved successfully');

    // Validate input text
    if (!text || text.trim() === '') {
      console.error('Empty input text');
      throw new Error('Please provide some text to generate variations');
    }

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
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    if (!data.content?.[0]?.text) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from Anthropic API');
    }

    const variations = data.content[0].text
      .split('\n')
      .filter((v: string) => v.trim().length > 0)
      .map((v: string) => v.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    console.log('Successfully generated variations:', variations);
    return variations;

  } catch (error) {
    console.error('Error in generateVariations:', error);
    // Rethrow with a user-friendly message
    throw new Error(error instanceof Error ? error.message : 'Failed to generate variations');
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