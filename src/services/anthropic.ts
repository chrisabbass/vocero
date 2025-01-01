import { supabase } from "@/integrations/supabase/client";

export const generateVariations = async (text: string, personality: string = 'friendly'): Promise<string[]> => {
  try {
    console.log('Starting variation generation process...');
    console.log('Input text:', text);
    console.log('Selected personality:', personality);
    
    // First, validate the input text
    if (!text || text.trim() === '') {
      console.error('Empty input text');
      throw new Error('Please provide some text to generate variations');
    }

    // Fetch API key with improved error handling
    console.log('Fetching API key from Supabase secrets...');
    const { data: apiKey, error: keyError } = await supabase.rpc('get_secret', {
      name: 'ANTHROPIC_API_KEY'
    });

    if (keyError) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Failed to fetch Anthropic API key. Please check your Supabase configuration.');
    }

    if (!apiKey) {
      console.error('No API key received');
      throw new Error('Anthropic API key not found in Supabase secrets. Please set it up.');
    }

    if (typeof apiKey !== 'string' || !apiKey.startsWith('sk-')) {
      console.error('Invalid API key format');
      throw new Error('Invalid Anthropic API key format. Please make sure you\'ve entered a valid key starting with "sk-"');
    }

    console.log('API key retrieved successfully');

    const systemPrompt = getPersonalityPrompt(personality);
    const userPrompt = `Create 3 variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.): ${text}`;

    console.log('Making API request to Anthropic...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ]
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

    // Handle the Claude 3 response format
    const content = data.content?.[0]?.text;
    if (!content) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from Anthropic API');
    }

    // Extract numbered variations from the response
    const variations = content
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((v: string) => v.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    if (variations.length === 0) {
      console.error('No variations found in response:', content);
      throw new Error('Failed to generate variations from API response');
    }

    console.log('Successfully generated variations:', variations);
    return variations;

  } catch (error) {
    console.error('Error in generateVariations:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate variations. Please try again.');
  }
};

const getPersonalityPrompt = (personality: string): string => {
  switch (personality) {
    case 'direct':
      return 'You are a professional content writer focused on creating clear, concise, and straightforward social media posts. Keep the tone direct and business-like.';
    case 'friendly':
      return 'You are a warm and approachable content writer creating engaging and relatable social media posts. Use a conversational and friendly tone.';
    case 'enthusiastic':
      return 'You are an energetic content writer creating exciting and dynamic social media posts. Use an upbeat and enthusiastic tone with appropriate exclamation marks!';
    default:
      return 'You are a professional content writer creating engaging social media posts with a balanced tone.';
  }
};