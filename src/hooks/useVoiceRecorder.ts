import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Function to get supported MIME type
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/wav',
      'audio/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using MIME type:', type);
        return type;
      }
    }
    return null;
  };

  const startRecording = async () => {
    try {
      audioChunks.current = [];
      
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      console.log('Microphone access granted');
      
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio MIME type found on this browser');
      }

      console.log('Creating MediaRecorder with MIME type:', mimeType);
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log('Audio chunk received, size:', event.data.size);
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log('Processing audio chunks...');
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        console.log('Audio blob created, size:', audioBlob.size, 'type:', audioBlob.type);
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, `audio.${mimeType.split('/')[1].split(';')[0]}`);

          console.log('Sending audio to Whisper API...');
          const response = await fetch('https://nmjmurbaaevmakymqiyc.supabase.co/functions/v1/whisper-transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Transcription API error:', errorData);
            throw new Error(errorData.error || 'Failed to transcribe audio');
          }

          const data = await response.json();
          console.log('Transcription received:', data);
          
          if (!data.text || data.text.trim() === '') {
            throw new Error('No speech detected');
          }
          
          setTranscript(data.text);
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to transcribe audio",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    setTranscript
  };
};