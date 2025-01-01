import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import type { SavedPost } from '@/types/post';

export const usePostManagement = () => {
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const { toast } = useToast();
  const { savedPosts, savePost, deletePost } = useSavedPosts();

  const handleSavePost = () => {
    const textToSave = selectedVariation || '';
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

  return {
    variations,
    setVariations,
    selectedVariation,
    setSelectedVariation,
    savedPosts,
    handleSavePost,
    deletePost,
  };
};