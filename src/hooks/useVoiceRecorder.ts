import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      audioChunks.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got media stream:', stream);
      
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log('Audio chunk received, size:', event.data.size);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        console.log('Recording completed, blob size:', audioBlob.size);
        
        try {
          // Create a FormData object to send the audio file
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');

          // Send the audio file to Whisper API through our Supabase Edge Function
          const response = await fetch('https://nmjmurbaaevmakymqiyc.supabase.co/functions/v1/whisper-transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const data = await response.json();
          console.log('Transcription received:', data);
          setTranscript(data.text);
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Error",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log('Recording stopped');
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