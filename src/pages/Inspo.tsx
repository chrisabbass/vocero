import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TopPost {
  post_content: string;
  impressions: number;
  likes: number;
  comments: number;
  reshares: number;
  category: string;
}

const Inspo = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['top-posts'],
    queryFn: async () => {
      console.log('Fetching top posts...');
      const { data, error } = await supabase
        .from('post_metrics')
        .select(`
          post_content,
          impressions,
          likes,
          comments,
          reshares,
          categorized_posts!inner(category)
        `)
        .order('impressions', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data);

      // Group posts by category and take top 10 from each
      const groupedPosts = data.reduce((acc: Record<string, TopPost[]>, post: any) => {
        const category = post.categorized_posts[0].category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          post_content: post.post_content,
          impressions: post.impressions,
          likes: post.likes,
          comments: post.comments,
          reshares: post.reshares,
          category,
        });
        return acc;
      }, {});

      // Take top 10 from each category
      Object.keys(groupedPosts).forEach(category => {
        groupedPosts[category] = groupedPosts[category].slice(0, 10);
      });

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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Top Performing Posts</h1>
      
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
            <div className="grid gap-6">
              {posts?.[value]?.map((post: TopPost, index: number) => (
                <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-sm font-medium flex justify-between items-center">
                      <span>#{index + 1}</span>
                      <span className="text-muted-foreground text-xs">
                        {post.impressions.toLocaleString()} impressions
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{post.post_content}</p>
                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                      <span>{post.likes.toLocaleString()} likes</span>
                      <span>{post.comments.toLocaleString()} comments</span>
                      <span>{post.reshares.toLocaleString()} reshares</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!posts?.[value] || posts[value].length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No posts found in this category yet.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Inspo;