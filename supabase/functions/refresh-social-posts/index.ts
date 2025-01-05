import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchLinkedInTopPosts(accessToken: string) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:organization:12345)&count=100', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return [];
  }
}

async function processAndStorePosts(posts: any[], platform: string) {
  try {
    for (const post of posts) {
      const { data, error } = await supabase
        .from('post_metrics')
        .upsert({
          platform,
          post_content: post.content || post.text,
          impressions: post.impressionCount || post.public_metrics?.impression_count || 0,
          likes: post.likeCount || post.public_metrics?.like_count || 0,
          comments: post.commentCount || post.public_metrics?.reply_count || 0,
          reshares: post.shareCount || post.public_metrics?.retweet_count || 0,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing post:', error);
        continue;
      }

      // Categorize post using simple keyword matching
      // In a production environment, you might want to use a more sophisticated categorization system
      const content = (post.content || post.text || '').toLowerCase();
      let category = 'business'; // default category

      if (content.includes('culture') || content.includes('art') || content.includes('music')) {
        category = 'culture';
      } else if (content.includes('politics') || content.includes('government') || content.includes('policy')) {
        category = 'politics';
      }

      await supabase
        .from('categorized_posts')
        .upsert({
          post_metrics_id: data.id,
          category
        });
    }
  } catch (error) {
    console.error('Error processing posts:', error);
  }
}

async function refreshTopPosts() {
  console.log('Starting top posts refresh...');

  // Get all social tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('user_social_tokens')
    .select('*');

  if (tokensError) {
    console.error('Error fetching tokens:', tokensError);
    return;
  }

  // Process LinkedIn posts
  const linkedInTokens = tokens?.filter(t => t.platform === 'linkedin') || [];
  for (const token of linkedInTokens) {
    const posts = await fetchLinkedInTopPosts(token.access_token);
    await processAndStorePosts(posts, 'linkedin');
  }

  console.log('Posts refresh completed');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await refreshTopPosts();
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