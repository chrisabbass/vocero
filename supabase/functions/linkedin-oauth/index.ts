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

async function handleLinkedInCallback(code: string, userId: string) {
  try {
    console.log('Handling LinkedIn callback for user:', userId);
    
    // Exchange code for access token
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
        redirect_uri: `${SUPABASE_URL}/functions/v1/linkedin-oauth`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    console.log('Received access token');

    // Store the token in the database
    const { error: upsertError } = await supabase
      .from('user_social_tokens')
      .upsert({
        user_id: userId,
        platform: 'linkedin',
        access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
      throw upsertError;
    }

    console.log('Successfully stored LinkedIn token for user:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error in handleLinkedInCallback:', error);
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
    const state = url.searchParams.get('state'); // state contains userId

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const result = await handleLinkedInCallback(code, state);
    
    // Redirect to the frontend after successful OAuth
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/schedule', // Redirect to schedule page
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});