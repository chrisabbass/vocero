import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = async (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/wav' });
        // For testing purposes, we'll set a simulated transcript
        const simulatedTranscript = "This is a simulated transcription of your voice note. In a real implementation, this would be the actual transcribed text from your voice recording.";
        console.log('Setting transcript:', simulatedTranscript);
        setTranscript(simulatedTranscript);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setTranscript(''); // Clear previous transcript
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