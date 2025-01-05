import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import TopPosts from '@/components/analytics/TopPosts';
import { useToast } from '@/hooks/use-toast';

interface TopPost {
  content: string;
  platform: string;
  totalImpressions: number;
  updated_at: string;
}

const Inspo = () => {
  const { toast } = useToast();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['top-posts'],
    queryFn: async () => {
      console.log('Starting to fetch top posts...');
      
      // First, trigger the fetch-social-posts function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('Authenticated user found, invoking fetch-social-posts function...');
      
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-social-posts', {
          body: { userId: user.id }
        });

        if (functionError) {
          console.error('Error fetching social posts:', functionError);
          toast({
            title: "Error",
            description: "Failed to fetch latest social posts. Please check your social media connections.",
            variant: "destructive",
          });
        } else {
          console.log('Successfully invoked fetch-social-posts function:', functionData);
        }
      } catch (error) {
        console.error('Error invoking fetch-social-posts:', error);
      }

      console.log('Fetching categorized posts from database...');

      // Then fetch the categorized posts
      const { data, error } = await supabase
        .from('post_metrics')
        .select(`
          id,
          post_content,
          platform,
          impressions,
          likes,
          comments,
          reshares,
          updated_at,
          categorized_posts!inner(category)
        `)
        .order('impressions', { ascending: false });

      if (error) {
        console.error('Error fetching posts from database:', error);
        throw error;
      }

      console.log('Fetched posts from database:', data);

      // Group posts by category
      const groupedPosts = data.reduce((acc: Record<string, TopPost[]>, post: any) => {
        const category = post.categorized_posts[0].category;
        if (!acc[category]) {
          acc[category] = [];
        }
        
        // Only take top 10 posts per category
        if (acc[category].length < 10) {
          acc[category].push({
            content: post.post_content,
            platform: post.platform,
            totalImpressions: post.impressions || 0,
            updated_at: post.updated_at
          });
        }
        return acc;
      }, {});

      console.log('Grouped posts by category:', groupedPosts);
      return groupedPosts;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading inspiring posts..." />;
  }

  if (error) {
    console.error('Error in posts query:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Unable to load posts</h2>
          <p className="text-red-600 mt-1">Please make sure you're connected to Twitter and LinkedIn</p>
        </div>
      </div>
    );
  }

  const categories = {
    business: "Business & Entrepreneurial",
    culture: "Popular Culture",
    politics: "Politics"
  };

  // Find the most recent update time across all posts
  const getLastUpdateTime = () => {
    let lastUpdate: Date | null = null;
    Object.values(posts || {}).forEach(categoryPosts => {
      categoryPosts.forEach(post => {
        const updateTime = new Date(post.updated_at);
        if (!lastUpdate || updateTime > lastUpdate) {
          lastUpdate = updateTime;
        }
      });
    });
    return lastUpdate ? format(lastUpdate, 'PPpp') : 'Never';
  };

  // Check if we have any posts at all
  const hasAnyPosts = posts && Object.values(posts).some(categoryPosts => categoryPosts.length > 0);

  if (!hasAnyPosts) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold">No posts found</h2>
          <p className="text-yellow-600 mt-1">
            Make sure you're connected to Twitter and LinkedIn, and have posted content on these platforms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Top Performing Posts</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {getLastUpdateTime()}
        </p>
      </div>
      
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {Object.entries(categories).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="text-sm md:text-base">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([value, label]) => (
          <TabsContent key={value} value={value}>
            <TopPosts posts={posts?.[value] || []} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Inspo;