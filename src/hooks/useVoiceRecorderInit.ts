import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useVoiceRecorder } from './useVoiceRecorder';

export const useVoiceRecorderInit = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecording, startRecording, stopRecording, transcript, setTranscript } = useVoiceRecorder();

  const cancelRecording = useCallback(() => {
    setIsProcessing(false);
    setTranscript('');
  }, [setTranscript]);

  const generateVariations = async (text: string, personality: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, personality }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate variations');
      }

      const data = await response.json();
      return data.variations;
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({
        title: "Error",
        description: "Failed to generate variations. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecorder = useCallback(() => {
    setIsProcessing(false);
    setTranscript('');
  }, [setTranscript]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
    generateVariations,
    resetRecorder,
  };
};