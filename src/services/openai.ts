import { supabase } from "@/integrations/supabase/client";

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generateVariations = async (text: string) => {
  console.log('Generating variations for text:', text);
  
  // Get the API key from Supabase
  const { data: apiKey, error: secretError } = await supabase.rpc('get_secret', {
    name: 'OPENAI_API_KEY'
  });

  if (secretError || !apiKey) {
    console.error('Error fetching OpenAI API key:', secretError);
    throw new Error('Failed to fetch OpenAI API key. Please ensure it is set in Supabase secrets.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a social media post optimizer. Generate 3 variations of the given text, optimizing for engagement while maintaining the original message. Make each variation unique in style."
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to generate variations');
  }

  const responseData = await response.json() as OpenAIResponse;
  console.log('OpenAI response:', responseData);
  
  if (responseData.choices && responseData.choices[0]) {
    return responseData.choices[0].message.content
      .split('\n')
      .filter((v: string) => v.trim().length > 0)
      .slice(0, 3);
  }
  
  return [];
};