import { supabase } from "@/integrations/supabase/client";
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

    console.log('Making request to Supabase Edge Function...');
    
    const systemPrompt = getPersonalityPrompt(personality);
    const userPrompt = `Create 3 variations of this text for social media, maintaining the selected tone. Each variation should be on a new line and start with a number (1., 2., 3.): ${text}`;

    const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      })
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Edge Function error: ${error.message}`);
    }

    console.log('Successfully received response from Edge Function');

    const content = data.content?.[0]?.text;
    if (!content) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from API');
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