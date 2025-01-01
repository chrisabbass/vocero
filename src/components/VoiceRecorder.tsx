import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { generateVariations } from '@/services/anthropic';
import { supabase } from '@/integrations/supabase/client';
import RecordButton from './RecordButton';
import Header from './Header';
import ToneSelector from './ToneSelector';
import PaywallDialog from './PaywallDialog';
import MainContent from './MainContent';
import LoadingSpinner from './LoadingSpinner';

type Personality = 'direct' | 'friendly' | 'enthusiastic';

const VoiceRecorder = () => {
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personality, setPersonality] = useState<Personality>('friendly');
  const [recordingCount, setRecordingCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { savedPosts, savePost, deletePost } = useSavedPosts();
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording,
    setTranscript 
  } = useVoiceRecorder();

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

  const handleLogoClick = () => {
    console.log('Logo clicked - resetting state');
    setVariations([]);
    setSelectedVariation('');
    setTranscript('');
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!isRecording && transcript) {
      handleTranscriptGenerated();
    }
  }, [transcript, isRecording]);

  const handleTranscriptGenerated = async () => {
    if (!transcript || transcript.trim() === '') {
      console.log('No transcript available');
      toast({
        title: "Error",
        description: "No speech was detected. Please try recording again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Generating variations with personality:', personality);
      const newVariations = await generateVariations(transcript, personality);
      console.log('Generated variations:', newVariations);
      setVariations(newVariations);
      setSelectedVariation(newVariations[0]);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const newCount = recordingCount + 1;
      const { error } = await supabase
        .from('profiles')
        .update({ recording_count: newCount })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating recording count:', error);
        toast({
          title: "Error",
          description: "Failed to update recording count.",
          variant: "destructive",
        });
        return;
      }

      setRecordingCount(newCount);
      if (newCount >= 3) {
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRecording = async () => {
    if (recordingCount >= 3) {
      setShowPaywall(true);
      return;
    }
    startRecording();
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Header onLogoClick={handleLogoClick} />
      
      <ToneSelector 
        personality={personality}
        onPersonalityChange={setPersonality}
      />

      <RecordButton
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
      />

      {(transcript || variations.length > 0) && (
        <MainContent
          transcript={transcript}
          variations={variations}
          selectedVariation={selectedVariation}
          onVariationChange={setSelectedVariation}
          onTranscriptChange={setTranscript}
          isGenerating={isGenerating}
          onSavePost={() => {
            const textToSave = selectedVariation || transcript;
            if (!textToSave) {
              toast({
                title: "Error",
                description: "No content to save",
                variant: "destructive",
              });
              return;
            }

            const saved = savePost(textToSave);
            if (saved) {
              toast({
                title: "Success",
                description: "Post saved successfully",
              });
            } else {
              toast({
                title: "Error",
                description: "Maximum number of saved posts reached (10)",
                variant: "destructive",
              });
            }
          }}
          savedPosts={savedPosts}
          onDeletePost={deletePost}
        />
      )}

      <PaywallDialog 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </div>
  );
};

export default VoiceRecorder;