import { useState, useEffect } from 'react';
import type { SavedPost } from '@/types/post';

const STORAGE_KEY = 'saved_posts';
const MAX_POSTS = 10;

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedPosts(JSON.parse(stored));
    }
  }, []);

  const savePost = (content: string) => {
    if (savedPosts.length >= MAX_POSTS) {
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
    return true;
  };

  const deletePost = (id: string) => {
    const updatedPosts = savedPosts.filter(post => post.id !== id);
    setSavedPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  return {
    savedPosts,
    savePost,
    deletePost,
  };
};