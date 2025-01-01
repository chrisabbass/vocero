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
  console.log('Rendering SavedPosts with posts:', posts);

  if (!Array.isArray(posts)) {
    console.error('Posts is not an array:', posts);
    return null;
  }

  return (
    <div className="mt-4 border rounded-lg p-3 mx-auto w-fit">
      <Carousel
        opts={{
          align: "start",
          loop: posts.length > 1,
        }}
        className="w-full relative"
      >
        <div className="flex items-center justify-center mb-2">
          <h2 className="text-lg font-semibold">
            Saved Posts ({posts.length}/10)
          </h2>
        </div>
        
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-2">No saved posts yet</p>
        ) : (
          <div className="relative px-8">
            {posts.length > 1 && (
              <>
                <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
              </>
            )}
            <CarouselContent>
              {posts.map((post) => (
                <CarouselItem key={post.id}>
                  <div className="flex flex-col space-y-2 p-3 border rounded-lg bg-white shadow-sm mx-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log('Deleting post:', post.id);
                          onDelete(post.id);
                        }}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
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