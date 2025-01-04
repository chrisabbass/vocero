import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')?.trim();
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')?.trim();
const LINKEDIN_REDIRECT_URI = Deno.env.get('LINKEDIN_REDIRECT_URI')?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getLinkedInAccessToken(code: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    console.error('LinkedIn credentials not configured');
    throw new Error('LinkedIn credentials not configured');
  }

  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn OAuth error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting LinkedIn access token:', error);
    throw error;
  }
}

async function postToLinkedIn(content: string, accessToken: string) {
  try {
    // Create the post without fetching profile first
    const postData = {
      author: `urn:li:person:${accessToken.split(':').pop()}`, // Extract member ID from token
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
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0', // Required for LinkedIn API v2
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LinkedIn API error details:', errorData);
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
      if (post.platform === 'linkedin') {
        const { data: userToken, error: tokenError } = await supabase
          .from('user_social_tokens')
          .select('access_token')
          .eq('user_id', post.user_id)
          .eq('platform', 'linkedin')
          .single();

        if (tokenError || !userToken) {
          console.error(`No LinkedIn token found for user ${post.user_id}`);
          continue;
        }

        await postToLinkedIn(post.content, userToken.access_token);
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