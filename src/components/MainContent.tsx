import React from 'react';
import VariationsSection from './VariationsSection';
import SavedPosts from './SavedPosts';
import type { SavedPost } from '@/types/post';
import PostActions from './PostActions';

interface MainContentProps {
  transcript: string;
  variations: string[];
  selectedVariation: string;
  onVariationChange: (variation: string) => void;
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
  isGenerating,
  onSavePost,
  savedPosts,
  onDeletePost,
}: MainContentProps) => {
  console.log('MainContent rendering with savedPosts:', savedPosts); // Debug log

  return (
    <div className="space-y-6">
      {variations.length > 0 && (
        <VariationsSection
          variations={variations}
          selectedVariation={selectedVariation}
          onVariationChange={onVariationChange}
          transcript={transcript}
          onTranscriptChange={() => {}} // Empty function since we don't allow manual changes
          isGenerating={isGenerating}
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