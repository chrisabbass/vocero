import { useState, useEffect } from 'react';
import type { SavedPost } from '@/types/post';

export const usePostManagement = () => {
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  // Load saved posts from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_posts');
      if (stored) {
        const parsedPosts = JSON.parse(stored);
        if (Array.isArray(parsedPosts)) {
          console.log('Loaded saved posts:', parsedPosts); // Debug log
          setSavedPosts(parsedPosts);
        }
      }
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  }, []);

  const handleSavePost = (content: string) => {
    try {
      if (savedPosts.length >= 10) {
        console.log('Maximum number of saved posts reached');
        return false;
      }

      const newPost: SavedPost = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
      };

      const updatedPosts = [newPost, ...savedPosts];
      setSavedPosts(updatedPosts);
      localStorage.setItem('saved_posts', JSON.stringify(updatedPosts));
      console.log('Post saved successfully:', newPost);
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  };

  const deletePost = (id: string) => {
    try {
      console.log('Deleting post:', id);
      const updatedPosts = savedPosts.filter(post => post.id !== id);
      setSavedPosts(updatedPosts);
      localStorage.setItem('saved_posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Error deleting post:', error);
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