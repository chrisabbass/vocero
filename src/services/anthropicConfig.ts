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
      throw new Error('Anthropic API key is missing. Please check the Supabase secrets table and ensure the API key is correctly set.');
    }

    console.log('Successfully retrieved Anthropic API key');
    return data.value;
  } catch (error) {
    console.error('Error in getAnthropicApiKey:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unexpected error retrieving Anthropic API key');
  }
};