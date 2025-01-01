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
          console.log('Audio chunk received:', event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        console.log('Recording completed, blob size:', audioBlob.size);
        
        // For now, we'll use a simulated response since we don't have a speech-to-text service
        // In a production environment, you would send this blob to a speech-to-text service
        const simulatedTranscript = "This is what you just said. In a real implementation, this would be the actual transcribed text from your voice recording.";
        console.log('Setting transcript:', simulatedTranscript);
        setTranscript(simulatedTranscript);
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