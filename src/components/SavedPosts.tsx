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
    <div className="mt-6 border rounded-lg p-4 relative">
      <Carousel
        opts={{
          align: "start",
          loop: posts.length > 1,
        }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex items-center justify-center mb-4 px-4">
          <h2 className="text-lg font-semibold">
            Saved Posts ({posts.length}/10)
          </h2>
        </div>
        
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No saved posts yet</p>
        ) : (
          <div className="relative px-8">
            {posts.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
              </>
            )}
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
                      textToShare={post.content}
                      onSave={() => {}}
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