import React from 'react';
import VariationsSection from './VariationsSection';
import PostActions from './PostActions';
import SavedPosts from './SavedPosts';
import type { SavedPost } from '@/types/post';

interface MainContentProps {
  transcript: string;
  variations: string[];
  selectedVariation: string;
  onVariationChange: (variation: string) => void;
  onTranscriptChange: (transcript: string) => void;
  isGenerating: boolean;
  onSavePost: () => void;
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
  return (
    <div className="space-y-4">
      <VariationsSection
        variations={variations}
        selectedVariation={selectedVariation}
        onVariationChange={onVariationChange}
        transcript={transcript}
        onTranscriptChange={onTranscriptChange}
        isGenerating={isGenerating}
      />
      
      <PostActions
        onSave={onSavePost}
        textToShare={selectedVariation || transcript}
      />

      <SavedPosts posts={savedPosts} onDelete={onDeletePost} />
    </div>
  );
};

export default MainContent;