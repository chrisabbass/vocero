import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')?.trim();
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')?.trim();
const LINKEDIN_ACCESS_TOKEN = Deno.env.get('LINKEDIN_ACCESS_TOKEN')?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function postToTwitter(content: string) {
  // Using Twitter API v2
  const url = 'https://api.twitter.com/2/tweets';
  const oauth = generateOAuthHeader('POST', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': oauth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw error;
  }
}

async function postToLinkedIn(content: string) {
  if (!LINKEDIN_ACCESS_TOKEN) {
    console.error('LinkedIn credentials not configured');
    throw new Error('LinkedIn credentials not configured');
  }

  try {
    // First, get the user's LinkedIn profile to get their URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.statusText}`);
    }

    const profile = await profileResponse.json();
    const authorUrn = profile.id;

    // Create the post
    const postData = {
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    throw error;
  }
}

async function processScheduledPosts() {
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('posted', false)
    .lte('scheduled_for', new Date().toISOString());

  if (error) {
    console.error('Error fetching scheduled posts:', error);
    return;
  }

  for (const post of posts) {
    try {
      if (post.platform === 'twitter') {
        await postToTwitter(post.content);
      } else if (post.platform === 'linkedin') {
        await postToLinkedIn(post.content);
      }

      // Mark post as posted
      await supabase
        .from('scheduled_posts')
        .update({ posted: true })
        .eq('id', post.id);

    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
    }
  }
}

// Function to generate OAuth 1.0a signature for Twitter
function generateOAuthHeader(method: string, url: string): string {
  // Your implementation for generating OAuth header goes here
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      await processScheduledPosts();
      return new Response(
        JSON.stringify({ message: 'Scheduled posts processed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
