import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')!;
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleLinkedInCallback(code: string, state: string) {
  try {
    console.log('[LinkedIn OAuth] Starting callback handling with code');
    console.log('[LinkedIn OAuth] State parameter:', state);
    
    // Parse the state parameter
    let parsedState;
    try {
      parsedState = JSON.parse(state);
      console.log('[LinkedIn OAuth] Parsed state:', parsedState);
    } catch (error) {
      console.error('[LinkedIn OAuth] Error parsing state:', error);
      throw new Error('Invalid state parameter');
    }
    
    // Exchange code for access token
    console.log('[LinkedIn OAuth] Exchanging code for access token');
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${SUPABASE_URL}/auth/v1/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[LinkedIn OAuth] Token exchange failed:', errorText);
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('[LinkedIn OAuth] Successfully received access token');

    // Get the user session to store the token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('[LinkedIn OAuth] No valid session found:', sessionError);
      throw new Error('No valid session found');
    }

    // Store the token in the database
    console.log('[LinkedIn OAuth] Storing token for user:', session.user.id);
    const { error: upsertError } = await supabase
      .from('user_social_tokens')
      .upsert({
        user_id: session.user.id,
        platform: 'linkedin',
        access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (upsertError) {
      console.error('[LinkedIn OAuth] Error storing token:', upsertError);
      throw upsertError;
    }

    console.log('[LinkedIn OAuth] Successfully stored token');
    return { success: true };
  } catch (error) {
    console.error('[LinkedIn OAuth] Error in callback:', error);
    throw error;
  }
}

// Handle incoming requests
Deno.serve(async (req) => {
  console.log('[LinkedIn OAuth] Received request:', req.method, req.url);
  
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

    console.log('[LinkedIn OAuth] Request parameters:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error, 
      error_description 
    });

    if (error || error_description) {
      console.error('[LinkedIn OAuth] Error from LinkedIn:', { error, error_description });
      return new Response(
        JSON.stringify({ error: error_description || 'OAuth error' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!code || !state) {
      console.error('[LinkedIn OAuth] Missing required parameters');
      throw new Error('Missing code or state parameter');
    }

    const result = await handleLinkedInCallback(code, state);
    console.log('[LinkedIn OAuth] Callback handled successfully:', result);
    
    // Get the return path from state
    const parsedState = JSON.parse(state);
    const returnPath = parsedState.returnTo || '/schedule';
    
    // Redirect to the frontend after successful OAuth
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': returnPath,
      },
    });
  } catch (error) {
    console.error('[LinkedIn OAuth] Error handling request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});