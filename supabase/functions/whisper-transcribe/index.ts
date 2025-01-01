import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Checking OpenAI API key...');

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    // Get the form data from the request
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile || !(audioFile instanceof File)) {
      console.error('No audio file provided in request');
      throw new Error('No audio file provided');
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validate audio file size
    if (audioFile.size === 0) {
      throw new Error('Audio file is empty');
    }

    if (audioFile.size > 25 * 1024 * 1024) { // 25MB limit
      throw new Error('Audio file too large. Maximum size is 25MB');
    }

    // Convert the file to array buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Create form data for OpenAI API
    const openAIFormData = new FormData();
    const audioBlob = new Blob([uint8Array], { type: 'audio/webm' }); // Explicitly set type to audio/webm
    openAIFormData.append('file', audioBlob, 'audio.webm');
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en');
    openAIFormData.append('response_format', 'json');

    console.log('Sending request to OpenAI Whisper API');

    // Send request to OpenAI's Whisper API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openAIFormData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Transcription successful:', data);

    if (!data.text || data.text.trim() === '') {
      throw new Error('No speech detected in the audio');
    }

    return new Response(JSON.stringify({ text: data.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in whisper-transcribe function:', error);
    
    // Check if it's an AbortError (timeout)
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: 'Request timed out. Please try again with a shorter audio recording.',
        details: error.message
      }), {
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});