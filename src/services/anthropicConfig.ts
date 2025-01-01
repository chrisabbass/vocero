import { supabase } from "@/integrations/supabase/client";

export const getAnthropicApiKey = async (): Promise<string> => {
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
    throw new Error('Anthropic API key not found in Supabase secrets. Please check if you have added it correctly.');
  }

  console.log('API key retrieved successfully');
  return apiKey;
};