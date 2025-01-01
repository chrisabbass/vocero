import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PostMetricsProps {
  postContent: string;
}

const PostMetrics = ({ postContent }: PostMetricsProps) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['post-metrics', postContent],
    queryFn: async () => {
      console.log('Fetching metrics for post:', postContent);
      const { data, error } = await supabase
        .from('post_metrics')
        .select('*')
        .eq('post_content', postContent)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics:', error);
        throw error;
      }

      console.log('Fetched metrics:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
  const totalLikes = metrics?.reduce((sum, m) => sum + (m.likes || 0), 0) || 0;
  const totalComments = metrics?.reduce((sum, m) => sum + (m.comments || 0), 0) || 0;
  const totalReshares = metrics?.reduce((sum, m) => sum + (m.reshares || 0), 0) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Impressions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{totalImpressions}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Likes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{totalLikes}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Comments</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{totalComments}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Reshares</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{totalReshares}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostMetrics;