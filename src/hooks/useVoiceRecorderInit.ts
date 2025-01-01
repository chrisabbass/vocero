import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceRecorderInit = () => {
  const [recordingCount, setRecordingCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
    isLoading
  };
};