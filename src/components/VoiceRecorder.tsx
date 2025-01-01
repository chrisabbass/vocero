import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { generateVariations } from '@/services/anthropic';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceRecorderInit } from '@/hooks/useVoiceRecorderInit';
import Header from './Header';
import ToneSelector from './ToneSelector';
import PaywallDialog from './PaywallDialog';
import MainContent from './MainContent';
import RecordingSection from './RecordingSection';
import type { SavedPost } from '@/types/post';

type Personality = 'direct' | 'friendly' | 'enthusiastic';

interface VoiceRecorderProps {
  savedPosts: SavedPost[];
  onSavePost: (content: string) => boolean;
  onDeletePost: (id: string) => void;
}

const VoiceRecorder = ({ savedPosts, onSavePost, onDeletePost }: VoiceRecorderProps) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [personality, setPersonality] = React.useState<Personality>('friendly');
  const [variations, setVariations] = React.useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = React.useState('');
  const { toast } = useToast();
  
  const {
    recordingCount,
    setRecordingCount,
    showPaywall,
    setShowPaywall,
    isLoading
  } = useVoiceRecorderInit();

  const handleLogoClick = () => {
    console.log('Logo clicked - resetting state');
    setVariations([]);
    setSelectedVariation('');
    setIsGenerating(false);
  };

  const handleTranscriptGenerated = async (transcript: string) => {
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

      <RecordingSection
        isGenerating={isGenerating}
        onTranscriptGenerated={handleTranscriptGenerated}
        recordingCount={recordingCount}
        onShowPaywall={() => setShowPaywall(true)}
      />

      {!isGenerating && variations.length > 0 && (
        <MainContent
          variations={variations}
          selectedVariation={selectedVariation}
          onVariationChange={setSelectedVariation}
          isGenerating={isGenerating}
          onSavePost={onSavePost}
          savedPosts={savedPosts}
          onDeletePost={onDeletePost}
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