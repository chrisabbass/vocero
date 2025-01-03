import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceRecorderInit = () => {
  const [recordingCount, setRecordingCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    setIsProcessing(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setIsProcessing(false);
  };

  const generateVariations = async (transcript: string, personality: string) => {
    console.log('Generating variations for transcript:', transcript);
    console.log('Using personality:', personality);
    
    try {
      const response = await supabase.functions.invoke('anthropic-proxy', {
        body: { transcript, personality }
      });

      if (response.error) {
        console.error('Error from edge function:', response.error);
        throw new Error(response.error.message || 'Failed to generate variations');
      }

      console.log('Received response:', response.data);
      
      if (!response.data?.variations || !Array.isArray(response.data.variations)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from API');
      }

      return response.data.variations;
    } catch (error) {
      console.error('Error generating variations:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('recording_count')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching recording count:', error);
            toast({
              title: "Error",
              description: "Failed to load user data. Please try refreshing the page.",
              variant: "destructive",
            });
            return;
          }

          setRecordingCount(data?.recording_count || 0);
          if ((data?.recording_count || 0) >= 3) {
            setShowPaywall(true);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          title: "Error",
          description: "Failed to initialize the application. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [toast]);

  return {
    recordingCount,
    setRecordingCount,
    showPaywall,
    setShowPaywall,
    isLoading,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
    generateVariations
  };
};