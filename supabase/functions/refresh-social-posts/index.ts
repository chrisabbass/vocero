import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchLinkedInMetrics(accessToken: string, postId: string) {
  try {
    const response = await fetch(`https://api.linkedin.com/v2/socialMetrics/${postId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      impressions: data.totalShareStatistics?.impressionCount || 0,
      likes: data.totalShareStatistics?.likeCount || 0,
      comments: data.totalShareStatistics?.commentCount || 0,
      reshares: data.totalShareStatistics?.shareCount || 0,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn metrics:', error);
    return null;
  }
}

async function refreshPostMetrics() {
  console.log('Starting post metrics refresh...');

  // Get all posts from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: posts, error: postsError } = await supabase
    .from('post_metrics')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }

  console.log(`Found ${posts.length} posts to refresh`);

  // Get all user social tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('user_social_tokens')
    .select('*');

  if (tokensError) {
    console.error('Error fetching tokens:', tokensError);
    return;
  }

  // Process each post
  for (const post of posts) {
    console.log(`Processing post: ${post.id}`);
    
    try {
      let metrics = null;

      // Find matching token for the post's platform
      const token = tokens.find(t => t.platform === post.platform);
      if (!token) {
        console.log(`No token found for platform: ${post.platform}`);
        continue;
      }

      if (post.platform === 'linkedin') {
        metrics = await fetchLinkedInMetrics(token.access_token, post.id);
      }

      if (metrics) {
        console.log(`Updating metrics for post ${post.id}:`, metrics);
        const { error: updateError } = await supabase
          .from('post_metrics')
          .update(metrics)
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating metrics for post ${post.id}:`, updateError);
        }
      }
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
    }
  }

  console.log('Post metrics refresh completed');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await refreshPostMetrics();
    return new Response(
      JSON.stringify({ message: 'Posts refreshed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-social-posts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});