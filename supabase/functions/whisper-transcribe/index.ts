import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting transcription process');
    
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
    const audioBlob = new Blob([uint8Array], { type: audioFile.type });
    openAIFormData.append('file', audioBlob, 'audio.wav');
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en'); // Specify English for better accuracy
    openAIFormData.append('response_format', 'json');

    console.log('Sending request to OpenAI Whisper API');

    // Send request to OpenAI's Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openAIFormData,
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      
      // More detailed error handling
      if (response.status === 401) {
        throw new Error('Authentication failed with OpenAI API');
      } else if (response.status === 400) {
        throw new Error('Invalid audio format or corrupted file');
      } else if (response.status === 413) {
        throw new Error('Audio file too large');
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
    
    // Send a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});