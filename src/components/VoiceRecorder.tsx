import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { generateVariations } from '@/services/openai';
import { Pen, Target, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RecordButton from './RecordButton';
import VariationsSection from './VariationsSection';
import PostActions from './PostActions';
import SavedPosts from './SavedPosts';

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

  const handleStopRecording = async () => {
    stopRecording();
    try {
      setIsGenerating(true);
      const newVariations = await generateVariations(transcript, personality);
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
        <p className="text-slate-600 mb-6">From Voice to Viral: Your AI Social Media Assistant</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700">Choose your tone</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        <ToggleGroup 
          type="single" 
          value={personality}
          onValueChange={(value: Personality) => value && setPersonality(value)}
          className="justify-center"
        >
          <ToggleGroupItem 
            value="direct" 
            aria-label="Direct tone" 
            className={`flex items-center gap-2 transition-all ${personality === 'direct' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
          >
            <Target className="h-4 w-4" />
            <span>Direct</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="friendly" 
            aria-label="Friendly tone" 
            className={`flex items-center gap-2 transition-all ${personality === 'friendly' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
          >
            <Heart className="h-4 w-4" />
            <span>Friendly</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="enthusiastic" 
            aria-label="Enthusiastic tone" 
            className={`flex items-center gap-2 transition-all ${personality === 'enthusiastic' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Enthusiastic</span>
          </ToggleGroupItem>
        </ToggleGroup>
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