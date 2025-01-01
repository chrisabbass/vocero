import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BarChart3 } from 'lucide-react';
import TimeRangeSelector from '@/components/analytics/TimeRangeSelector';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import PostsList from '@/components/analytics/PostsList';
import TopPosts from '@/components/analytics/TopPosts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Query for all metrics data
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['post-metrics', timeRange],
    queryFn: async () => {
      console.log('Fetching metrics for time range:', timeRange);
      const now = new Date();
      let startDate = new Date();
      
      switch(timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      const { data, error } = await supabase
        .from('post_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching metrics:', error);
        throw error;
      }

      console.log('Fetched metrics:', data);
      return data;
    },
  });

  // Query for unique shared posts
  const { data: sharedPosts, isLoading: isLoadingSharedPosts } = useQuery({
    queryKey: ['shared-posts'],
    queryFn: async () => {
      console.log('Fetching shared posts');
      const { data, error } = await supabase
        .from('post_metrics')
        .select('post_content')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shared posts:', error);
        throw error;
      }

      const uniquePosts = Array.from(new Set(data.map(m => m.post_content)));
      console.log('Unique shared posts:', uniquePosts);
      return uniquePosts;
    },
  });

  // Query for top performing posts
  const { data: topPosts, isLoading: isLoadingTopPosts } = useQuery({
    queryKey: ['top-posts'],
    queryFn: async () => {
      console.log('Fetching top performing posts');
      const { data, error } = await supabase
        .from('post_metrics')
        .select('post_content, platform, impressions')
        .order('impressions', { ascending: false });

      if (error) {
        console.error('Error fetching top posts:', error);
        throw error;
      }

      const postsMap = new Map();
      data.forEach(post => {
        if (!postsMap.has(post.post_content)) {
          postsMap.set(post.post_content, {
            content: post.post_content,
            platform: post.platform,
            totalImpressions: post.impressions || 0
          });
        } else {
          const existing = postsMap.get(post.post_content);
          postsMap.set(post.post_content, {
            ...existing,
            totalImpressions: existing.totalImpressions + (post.impressions || 0)
          });
        }
      });

      const topPosts = Array.from(postsMap.values())
        .sort((a, b) => b.totalImpressions - a.totalImpressions)
        .slice(0, 5);

      console.log('Top performing posts:', topPosts);
      return topPosts;
    },
  });

  const aggregateMetricsByDate = (metrics: any[]) => {
    if (!metrics) return [];
    
    const aggregated = metrics.reduce((acc: any, curr: any) => {
      const date = new Date(curr.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          impressions: 0,
          likes: 0,
          comments: 0,
          reshares: 0,
        };
      }
      acc[date].impressions += curr.impressions || 0;
      acc[date].likes += curr.likes || 0;
      acc[date].comments += curr.comments || 0;
      acc[date].reshares += curr.reshares || 0;
      return acc;
    }, {});

    return Object.values(aggregated);
  };

  const chartData = aggregateMetricsByDate(metrics);

  if (isLoading || isLoadingSharedPosts || isLoadingTopPosts) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Analytics Dashboard
          </h1>
          <TimeRangeSelector value={timeRange} onValueChange={setTimeRange} />
        </div>

        <PerformanceChart data={chartData} />
        <PostsList posts={sharedPosts || []} />
        <TopPosts posts={topPosts || []} />
      </div>
    </div>
  );
};

export default Analytics;