import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWITTER_CONSUMER_KEY = Deno.env.get('TWITTER_CONSUMER_KEY')?.trim();
const TWITTER_CONSUMER_SECRET = Deno.env.get('TWITTER_CONSUMER_SECRET')?.trim();
const TWITTER_ACCESS_TOKEN = Deno.env.get('TWITTER_ACCESS_TOKEN')?.trim();
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
  // LinkedIn posting would go here
  // Note: LinkedIn API requires OAuth 2.0 and user authentication
  console.log('LinkedIn posting not implemented yet');
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

Deno.serve(async (req) => {
  try {
    if (req.method === 'POST') {
      await processScheduledPosts();
      return new Response(
        JSON.stringify({ message: 'Scheduled posts processed successfully' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
