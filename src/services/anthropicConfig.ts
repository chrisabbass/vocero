import { supabase } from "@/integrations/supabase/client";

export const getAnthropicApiKey = async (): Promise<string> => {
  console.log('Fetching Anthropic API key from Supabase secrets...');
  
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'ANTHROPIC_API_KEY')
      .maybeSingle();

    if (error) {
      console.error('Database error when fetching Anthropic API key:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error('Failed to fetch Anthropic API key from database');
    }

    if (!data || !data.value) {
      console.error('No Anthropic API key found in database. Data returned:', data);
      throw new Error('Anthropic API key not found in database. Please ensure it is set in Supabase secrets.');
    }

    console.log('Successfully retrieved Anthropic API key');
    return data.value;
  } catch (error) {
    console.error('Error in getAnthropicApiKey:', error);
    throw new Error('Failed to retrieve Anthropic API key. Please check console for details.');
  }
};