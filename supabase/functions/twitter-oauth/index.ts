import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWITTER_CLIENT_ID = Deno.env.get('TWITTER_CLIENT_ID')!;
const TWITTER_CLIENT_SECRET = Deno.env.get('TWITTER_CLIENT_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleTwitterCallback(code: string, stateParam: string) {
  try {
    console.log('Handling Twitter callback with state:', stateParam);
    
    // Parse the state parameter
    const state = JSON.parse(stateParam);
    const userId = state.userId;

    console.log('Parsed user ID from state:', userId);
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${SUPABASE_URL}/auth/v1/callback`,
        code_verifier: 'challenge',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitter token exchange failed:', errorText);
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully received access token');

    // Store the token in the database using the service role key
    const { error: upsertError } = await supabase
      .from('user_social_tokens')
      .upsert({
        user_id: userId,
        platform: 'twitter',
        access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
      throw upsertError;
    }

    console.log('Successfully stored Twitter token for user:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error in handleTwitterCallback:', error);
    throw error;
  }
}

// Handle incoming requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const error_description = url.searchParams.get('error_description');

    console.log('Received OAuth callback with params:', { 
      code: !!code, 
      state: !!state, 
      error, 
      error_description 
    });

    if (error || error_description) {
      console.error('Twitter OAuth error:', { error, error_description });
      return new Response(
        JSON.stringify({ error: error_description || 'OAuth error' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      throw new Error('Missing code or state parameter');
    }

    await handleTwitterCallback(code, state);
    
    // Redirect to the frontend after successful OAuth
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/schedule',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});