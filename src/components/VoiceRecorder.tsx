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
  const [personality, setPersonality] = useState('friendly');

  const {
    isRecording,
    recordingTime,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
    generateVariations,
  } = useVoiceRecorderInit();

  const handleLogoClick = () => {
    console.log('Logo clicked - resetting all states');
    setVariations([]);
    setSelectedVariation('');
    setIsGenerating(false);
    setTranscript('');
    setProcessingTranscript('');
    setPersonality('friendly'); // Reset personality to default
  };

  const handleTranscriptGenerated = async (newTranscript: string) => {
    console.log('New transcript generated:', newTranscript);
    if (newTranscript === processingTranscript) {
      console.log('This transcript is already being processed');
      return;
    }

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
          isRecording={isRecording}
          recordingTime={recordingTime}
          isProcessing={isProcessing}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
          onTranscriptGenerated={handleTranscriptGenerated}
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