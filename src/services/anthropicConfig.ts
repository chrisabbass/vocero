import { supabase } from "@/integrations/supabase/client";

export const getAnthropicApiKey = async (): Promise<string> => {
  console.log('Fetching Anthropic API key from Supabase secrets...');
  
  const { data: secretValue, error } = await supabase
    .from('secrets')
    .select('value')
    .eq('name', 'ANTHROPIC_API_KEY')
    .maybeSingle();

  if (error) {
    console.error('Error fetching Anthropic API key:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error('Failed to fetch Anthropic API key from database');
  }

  if (!secretValue?.value) {
    console.error('No Anthropic API key found in database');
    throw new Error('Anthropic API key not found in database. Please make sure you have added it correctly using the secret form.');
  }

  console.log('Successfully retrieved Anthropic API key');
  return secretValue.value;
};