import { supabase } from "@/integrations/supabase/client";

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const getPersonalityPrompt = (personality: string) => {
  switch (personality) {
    case 'direct':
      return "You are a concise and straightforward social media writer. Focus on clarity and brevity. Get straight to the point without unnecessary words or fluff.";
    case 'friendly':
      return "You are a warm and approachable social media writer. Write in a conversational, relatable tone that makes readers feel comfortable and connected.";
    case 'enthusiastic':
      return "You are an energetic and passionate social media writer. Use dynamic language and show excitement about the topic. Make the content engaging and inspiring!";
    default:
      return "You are a professional social media writer focused on creating engaging content.";
  }
};

export const generateVariations = async (text: string, personality: string = 'friendly') => {
  console.log('Generating variations for text:', text, 'with personality:', personality);
  
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
        content: getPersonalityPrompt(personality)
      }, {
        role: "user",
        content: `Create 3 variations of this text for social media, maintaining the selected tone: ${text}`
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