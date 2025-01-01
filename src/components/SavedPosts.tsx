import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import type { SavedPost } from '@/types/post';
import PostActions from './PostActions';

interface SavedPostsProps {
  posts: SavedPost[];
  onDelete: (id: string) => void;
}

const SavedPosts = ({ posts, onDelete }: SavedPostsProps) => {
  return (
    <div className="mt-6 border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Saved Posts ({posts.length}/10)</h2>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No saved posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col space-y-2 p-2 border rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(post.timestamp).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(post.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <PostActions
                  onSave={() => {}}
                  textToShare={post.content}
                  isSavedPost={true}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SavedPosts;