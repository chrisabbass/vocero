import { supabase } from "@/integrations/supabase/client";

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
    
    const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
      body: {
        transcript: text,
        personality: personality
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Edge Function error: ${error.message}`);
    }

    console.log('Successfully received response from Edge Function:', data);

    if (!data.variations || !Array.isArray(data.variations) || data.variations.length !== 3) {
      console.error('Invalid response format or wrong number of variations:', data);
      throw new Error('Failed to generate exactly 3 variations');
    }

    console.log('Successfully generated variations:', data.variations);
    return data.variations;

  } catch (error) {
    console.error('Error in generateVariations:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate variations. Please try again.');
  }
};