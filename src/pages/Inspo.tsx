import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import TopPosts from '@/components/analytics/TopPosts';
import { useToast } from '@/components/ui/use-toast';

interface TopPost {
  content: string;
  platform: string;
  totalImpressions: number;
  updated_at: string;
}

const Inspo = () => {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['top-posts'],
    queryFn: async () => {
      console.log('Fetching top posts...');
      
      // First, trigger the fetch-social-posts function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-social-posts', {
          body: { userId: user.id }
        });

        if (functionError) {
          console.error('Error fetching social posts:', functionError);
          toast({
            title: "Error",
            description: "Failed to fetch latest social posts",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error invoking fetch-social-posts:', error);
      }

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
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data);

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
            totalImpressions: post.impressions,
            updated_at: post.updated_at
          });
        }
        return acc;
      }, {});

      return groupedPosts;
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading inspiring posts..." />;
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