import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import VariationsSection from './VariationsSection';
import SavedPosts from './SavedPosts';
import type { SavedPost } from '@/types/post';
import PostActions from './PostActions';

interface MainContentProps {
  transcript: string;
  variations: string[];
  selectedVariation: string;
  onVariationChange: (variation: string) => void;
  onTranscriptChange: (transcript: string) => void;
  isGenerating: boolean;
  onSavePost: (content: string) => void;
  savedPosts: SavedPost[];
  onDeletePost: (id: string) => void;
}

const MainContent = ({
  transcript,
  variations,
  selectedVariation,
  onVariationChange,
  onTranscriptChange,
  isGenerating,
  onSavePost,
  savedPosts,
  onDeletePost,
}: MainContentProps) => {
  console.log('MainContent rendering with savedPosts:', savedPosts); // Debug log

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Your transcribed text will appear here..."
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={() => onVariationChange(transcript)}
          disabled={isGenerating || !transcript}
          className="w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Variations'}
        </Button>
      </div>

      {variations.length > 0 && (
        <VariationsSection
          variations={variations}
          selectedVariation={selectedVariation}
          onVariationChange={onVariationChange}
        />
      )}

      {selectedVariation && (
        <PostActions
          textToShare={selectedVariation}
          onSave={() => onSavePost(selectedVariation)}
          isSavedPost={false}
        />
      )}

      <SavedPosts posts={savedPosts} onDelete={onDeletePost} />
    </div>
  );
};

export default MainContent;