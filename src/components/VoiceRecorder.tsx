import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { generateVariations } from '@/services/anthropic';
import RecordButton from './RecordButton';
import VariationsSection from './VariationsSection';
import PostActions from './PostActions';
import SavedPosts from './SavedPosts';
import Header from './Header';
import ToneSelector from './ToneSelector';

type Personality = 'direct' | 'friendly' | 'enthusiastic';

const VoiceRecorder = () => {
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personality, setPersonality] = useState<Personality>('friendly');
  const { toast } = useToast();
  const { savedPosts, savePost, deletePost } = useSavedPosts();
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording,
    setTranscript 
  } = useVoiceRecorder();

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

  const handleStopRecording = () => {
    console.log('Stopping recording...');
    stopRecording();
  };

  const handleSavePost = () => {
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
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Header onLogoClick={handleLogoClick} />
      
      <ToneSelector 
        personality={personality}
        onPersonalityChange={setPersonality}
      />

      <RecordButton
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={handleStopRecording}
      />

      {(transcript || variations.length > 0) && (
        <div className="space-y-4">
          <VariationsSection
            variations={variations}
            selectedVariation={selectedVariation}
            onVariationChange={setSelectedVariation}
            transcript={transcript}
            onTranscriptChange={setTranscript}
            isGenerating={isGenerating}
          />
          
          <PostActions
            onSave={handleSavePost}
            textToShare={selectedVariation || transcript}
          />
        </div>
      )}

      <SavedPosts posts={savedPosts} onDelete={deletePost} />
    </div>
  );
};

export default VoiceRecorder;