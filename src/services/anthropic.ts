import { supabase } from "@/integrations/supabase/client";
import { getAnthropicApiKey } from "./anthropicConfig";
import { getPersonalityPrompt } from "./personalityPrompts";

export const generateVariations = async (text: string, personality: string = 'friendly'): Promise<string[]> => {
  try {
    console.log('Starting variation generation process...');
    console.log('Input text:', text);
    console.log('Selected personality:', personality);
    
    if (!text || text.trim() === '') {
      console.error('Empty input text');
      throw new Error('Please provide some text to generate variations');
    }

    const apiKey = await getAnthropicApiKey();
    console.log('Successfully retrieved API key, making request to Anthropic...');
    
    const systemPrompt = getPersonalityPrompt(personality);
    const userPrompt = `Create 3 variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.): ${text}`;

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

    console.log('Received response from Anthropic API:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error response:', errorText);
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully parsed API response');

    const content = data.content?.[0]?.text;
    if (!content) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from Anthropic API');
    }

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