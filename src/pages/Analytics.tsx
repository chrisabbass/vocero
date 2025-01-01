import React, { useState } from 'react';
import PostMetrics from '@/components/PostMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis } from "recharts";

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

      // Get unique posts
      const uniquePosts = Array.from(new Set(data.map(m => m.post_content)));
      console.log('Unique shared posts:', uniquePosts);
      return uniquePosts;
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

  if (isLoading || isLoadingSharedPosts) {
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
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Performance Over Time</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <ChartContainer className="h-[400px]" config={{}}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="impressions" stroke="#2563eb" />
                <Line type="monotone" dataKey="likes" stroke="#16a34a" />
                <Line type="monotone" dataKey="comments" stroke="#d97706" />
                <Line type="monotone" dataKey="reshares" stroke="#dc2626" />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Individual Post Performance</h2>
        {sharedPosts && sharedPosts.length > 0 ? (
          <div className="space-y-8">
            {sharedPosts.map((postContent) => (
              <div key={postContent} className="bg-white rounded-lg shadow p-6">
                <p className="text-sm mb-4">{postContent}</p>
                <PostMetrics postContent={postContent} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No shared posts found. Share some posts on Twitter or LinkedIn to see their performance here.
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;