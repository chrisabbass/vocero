import React from 'react';
import PostMetrics from '@/components/PostMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: async () => {
      console.log('Fetching saved posts for analytics');
      // This is a placeholder - you'll need to implement the actual saved posts fetching
      // based on how you're storing them
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="space-y-8">
        {posts?.map((post: any) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm mb-4">{post.content}</p>
            <PostMetrics postContent={post.content} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;