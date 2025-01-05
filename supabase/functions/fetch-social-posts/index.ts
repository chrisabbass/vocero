import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { createHmac } from "https://deno.land/std@0.210.0/crypto/mod.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWITTER_API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const TWITTER_API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const TWITTER_ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    TWITTER_API_SECRET!,
    TWITTER_ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function fetchTwitterPosts() {
  try {
    const url = 'https://api.twitter.com/2/users/me/tweets?max_results=100&tweet.fields=public_metrics,created_at';
    const method = 'GET';
    const oauthHeader = generateOAuthHeader(method, url);

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: oauthHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Twitter posts:', error);
    return [];
  }
}

async function fetchLinkedInPosts(userId: string) {
  try {
    const { data: tokens } = await supabase
      .from('user_social_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .single();

    if (!tokens?.access_token) {
      throw new Error('No LinkedIn access token found');
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:me)&count=100', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return [];
  }
}

function categorizePost(content: string): 'business' | 'culture' | 'politics' {
  const lowerContent = content.toLowerCase();
  
  // Business keywords
  const businessKeywords = ['startup', 'business', 'entrepreneur', 'company', 'market', 'innovation', 'leadership'];
  // Culture keywords
  const cultureKeywords = ['art', 'music', 'culture', 'film', 'book', 'creative', 'design'];
  // Politics keywords
  const politicsKeywords = ['policy', 'government', 'politics', 'election', 'democracy', 'law', 'regulation'];

  let scores = {
    business: 0,
    culture: 0,
    politics: 0
  };

  businessKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) scores.business++;
  });

  cultureKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) scores.culture++;
  });

  politicsKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) scores.politics++;
  });

  // Return the category with the highest score, default to business
  if (scores.culture > scores.business && scores.culture > scores.politics) return 'culture';
  if (scores.politics > scores.business && scores.politics > scores.culture) return 'politics';
  return 'business';
}

async function processAndStorePosts(posts: any[], platform: string, userId: string) {
  for (const post of posts) {
    try {
      const postContent = platform === 'twitter' 
        ? post.text 
        : post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '';

      const metrics = platform === 'twitter'
        ? post.public_metrics
        : {
            impressionCount: post.totalShareStatistics?.impressionCount || 0,
            likeCount: post.totalShareStatistics?.likeCount || 0,
            commentCount: post.totalShareStatistics?.commentCount || 0,
            shareCount: post.totalShareStatistics?.shareCount || 0,
          };

      // Insert or update post metrics
      const { data: metricData, error: metricError } = await supabase
        .from('post_metrics')
        .upsert({
          post_content: postContent,
          platform,
          impressions: metrics.impressionCount || metrics.impression_count || 0,
          likes: metrics.likeCount || metrics.like_count || 0,
          comments: metrics.commentCount || metrics.reply_count || 0,
          reshares: metrics.shareCount || metrics.retweet_count || 0,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (metricError) {
        console.error('Error storing post metrics:', metricError);
        continue;
      }

      // Categorize and store post category
      const category = categorizePost(postContent);
      
      await supabase
        .from('categorized_posts')
        .upsert({
          post_metrics_id: metricData.id,
          category
        });

    } catch (error) {
      console.error(`Error processing ${platform} post:`, error);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    console.log('Processing posts for user:', userId);

    // Fetch posts from both platforms
    const [twitterPosts, linkedinPosts] = await Promise.all([
      fetchTwitterPosts(),
      fetchLinkedInPosts(userId)
    ]);

    console.log(`Fetched ${twitterPosts.length} Twitter posts and ${linkedinPosts.length} LinkedIn posts`);

    // Process and store posts
    await Promise.all([
      processAndStorePosts(twitterPosts, 'twitter', userId),
      processAndStorePosts(linkedinPosts, 'linkedin', userId)
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in fetch-social-posts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});