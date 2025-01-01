import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { SavedPost } from '@/types/post';
import PostActions from './PostActions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SavedPostsProps {
  posts: SavedPost[];
  onDelete: (id: string) => void;
}

const SavedPosts = ({ posts, onDelete }: SavedPostsProps) => {
  console.log('Rendering SavedPosts with posts:', posts); // Debug log

  if (!Array.isArray(posts)) {
    console.error('Posts is not an array:', posts);
    return null;
  }

  return (
    <div className="mt-6 border rounded-lg p-4">
      <Carousel
        opts={{
          align: "start",
          loop: posts.length > 1,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          {posts.length > 0 && (
            <CarouselPrevious className="relative left-0 translate-y-0" />
          )}
          <h2 className="text-lg font-semibold text-center">
            Saved Posts ({posts.length}/10)
          </h2>
          {posts.length > 0 && (
            <CarouselNext className="relative right-0 translate-y-0" />
          )}
        </div>
        
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No saved posts yet</p>
        ) : (
          <div className="relative">
            <CarouselContent>
              {posts.map((post) => (
                <CarouselItem key={post.id} className="px-1">
                  <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log('Deleting post:', post.id); // Debug log
                          onDelete(post.id);
                        }}
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
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default SavedPosts;