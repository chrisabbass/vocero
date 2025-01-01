import { supabase } from "@/integrations/supabase/client";

export const generateVariations = async (text: string) => {
  console.log('Generating variations for text:', text);
  
  // Get the API key from Supabase
  const { data, error: secretError } = await supabase.rpc('get_secret', {
    name: 'OPENAI_API_KEY'
  });

  if (secretError || !data) {
    console.error('Error fetching OpenAI API key:', secretError);
    throw new Error('Failed to fetch OpenAI API key. Please ensure it is set in Supabase secrets.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data}`
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

  const data = await response.json();
  console.log('OpenAI response:', data);
  
  if (data.choices && data.choices[0]) {
    return data.choices[0].message.content
      .split('\n')
      .filter((v: string) => v.trim().length > 0)
      .slice(0, 3);
  }
  
  return [];
};