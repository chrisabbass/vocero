import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Header from './Header';
import RecordingSection from './RecordingSection';
import MainContent from './MainContent';
import ToneSelector from './ToneSelector';
import type { SavedPost } from '@/types/post';
import { useVoiceRecorderInit } from '@/hooks/useVoiceRecorderInit';
import type { Personality } from './ToneSelector';

interface VoiceRecorderProps {
  savedPosts: SavedPost[];
  onSavePost: (content: string) => void;
  onDeletePost: (id: string) => void;
}

const VoiceRecorder = ({ savedPosts, onSavePost, onDeletePost }: VoiceRecorderProps) => {
  console.log('VoiceRecorder rendering with savedPosts:', savedPosts);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processingTranscript, setProcessingTranscript] = useState('');
  const [personality, setPersonality] = useState<Personality>('friendly');

  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
    generateVariations,
  } = useVoiceRecorderInit();

  const handleLogoClick = () => {
    console.log('Logo clicked - resetting states without regeneration');
    resetStates();
  };

  const resetStates = () => {
    setVariations([]);
    setSelectedVariation('');
    setIsGenerating(false);
    setTranscript('');
    setProcessingTranscript('');
  };

  const handleTranscriptGenerated = async (newTranscript: string) => {
    console.log('New transcript generated:', newTranscript);
    
    // Reset states when new audio is detected
    if (newTranscript && newTranscript.trim() !== '') {
      console.log('Valid transcript detected, resetting states');
      resetStates();
      setTranscript(newTranscript);
      setProcessingTranscript(newTranscript);
      setIsGenerating(true);

      try {
        const newVariations = await generateVariations(newTranscript, personality);
        console.log('Generated variations:', newVariations);
        setVariations(newVariations);
        setSelectedVariation(newVariations[0] || '');
      } catch (error) {
        console.error('Error generating variations:', error);
        toast({
          title: "Error",
          description: "Failed to generate variations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      console.log('Empty or invalid transcript, skipping generation');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header onLogoClick={handleLogoClick} />
      
      <div className="mt-8 space-y-8">
        <ToneSelector
          personality={personality}
          onPersonalityChange={setPersonality}
          disabled={isRecording || isProcessing || isGenerating}
        />

        <RecordingSection
          isGenerating={isGenerating}
          onTranscriptGenerated={handleTranscriptGenerated}
          recordingCount={0}
          onShowPaywall={() => {}}
        />

        <MainContent
          transcript={transcript}
          variations={variations}
          selectedVariation={selectedVariation}
          onVariationChange={setSelectedVariation}
          isGenerating={isGenerating}
          onSavePost={onSavePost}
          savedPosts={savedPosts}
          onDeletePost={onDeletePost}
        />
      </div>
    </div>
  );
};

export default VoiceRecorder;