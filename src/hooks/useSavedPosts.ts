import { useState, useEffect } from 'react';
import type { SavedPost } from '@/types/post';

const STORAGE_KEY = 'saved_posts';
const MAX_POSTS = 10;

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  // Load saved posts from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPosts = JSON.parse(stored);
        if (Array.isArray(parsedPosts)) {
          console.log('Loaded saved posts from localStorage:', parsedPosts);
          setSavedPosts(parsedPosts);
        } else {
          console.error('Stored posts is not an array:', parsedPosts);
          setSavedPosts([]);
        }
      }
    } catch (error) {
      console.error('Error loading saved posts:', error);
      setSavedPosts([]);
    }
  }, []);

  const savePost = (content: string) => {
    try {
      if (savedPosts.length >= MAX_POSTS) {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      console.log('Post saved successfully:', newPost);
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  };

  const deletePost = (id: string) => {
    try {
      const updatedPosts = savedPosts.filter(post => post.id !== id);
      setSavedPosts(updatedPosts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      console.log('Post deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return {
    savedPosts,
    savePost,
    deletePost,
  };
};