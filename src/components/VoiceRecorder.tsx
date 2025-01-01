import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { generateVariations } from '@/services/openai';
import { Pen } from 'lucide-react';
import RecordButton from './RecordButton';
import VariationsSection from './VariationsSection';
import PostActions from './PostActions';
import SavedPosts from './SavedPosts';

const VoiceRecorder = () => {
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { savedPosts, savePost, deletePost } = useSavedPosts();
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording,
    setTranscript 
  } = useVoiceRecorder();

  const handleStopRecording = async () => {
    stopRecording();
    try {
      setIsGenerating(true);
      const newVariations = await generateVariations(transcript);
      setVariations(newVariations);
      setSelectedVariation(newVariations[0]);
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({
        title: "Error",
        description: "Failed to generate variations. Please check if your OpenAI API key is set correctly.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
      <div className="text-center">
        <h1 className="text-4xl font-bold italic mb-2 flex items-center justify-center gap-2" style={{ fontFamily: 'Inter', letterSpacing: '-0.025em' }}>
          <Pen className="w-8 h-8 text-purple-600" />
          Postful
        </h1>
        <p className="text-slate-600 mb-6">Record your voice to create a social post</p>
      </div>

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
            onTranscriptChange={(e) => setTranscript(e)}
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