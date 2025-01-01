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
      
      // Enhanced audio constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      
      console.log('Got media stream:', stream.getTracks());
      
      // Use proper MIME type and configuration
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      mediaRecorder.current = new MediaRecorder(stream, options);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log('Audio chunk received, size:', event.data.size, 'type:', event.data.type);
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log('Processing audio chunks...');
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        console.log('Recording completed, blob size:', audioBlob.size, 'type:', audioBlob.type);
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          console.log('Sending audio to Whisper API...');
          const response = await fetch('https://nmjmurbaaevmakymqiyc.supabase.co/functions/v1/whisper-transcribe', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Transcription error response:', errorData);
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
            description: error instanceof Error ? error.message : "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        }
      };

      // Set timeslice to 10ms for more frequent ondataavailable events
      mediaRecorder.current.start(10);
      setIsRecording(true);
      console.log('Recording started with configuration:', options);
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
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
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