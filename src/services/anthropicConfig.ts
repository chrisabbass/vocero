import { supabase } from "@/integrations/supabase/client";

export const getAnthropicApiKey = async (): Promise<string> => {
  console.log('Fetching Anthropic API key from Supabase secrets...');
  
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'ANTHROPIC_API_KEY')
      .single();

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
      
      // Provide a more helpful error message
      throw new Error('Anthropic API key is missing. Please add the API key in the Supabase secrets table.');
    }

    console.log('Successfully retrieved Anthropic API key');
    return data.value;
  } catch (error) {
    console.error('Comprehensive error in getAnthropicApiKey:', error);
    
    // If the error is an instance of Error, rethrow it, otherwise create a new error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unexpected error retrieving Anthropic API key');
  }
};