import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Welcome email function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailRequest = await req.json();
    console.log('Sending welcome email to:', email);

    const welcomeHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #6366f1; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v6"></path>
              <path d="M12 12v6"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Vocero
          </h1>
          <p style="color: #4b5563; margin-bottom: 24px;">Your AI Social Media Assistant</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #111827; margin-bottom: 16px;">Welcome to Vocero! 🎉</h2>
          <p style="color: #4b5563; margin-bottom: 24px;">
            We're excited to have you on board. Vocero is here to help you create engaging social media content effortlessly using just your voice.
          </p>
          
          <h3 style="color: #111827; margin-bottom: 16px;">Here's how to get started:</h3>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #4b5563; margin-bottom: 8px;">
              <strong>1. Record Your Ideas</strong><br>
              Click the microphone button and speak your content ideas naturally.
            </p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #4b5563; margin-bottom: 8px;">
              <strong>2. Choose Your Tone</strong><br>
              Select a personality type to match your brand's voice.
            </p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #4b5563; margin-bottom: 8px;">
              <strong>3. Generate & Share</strong><br>
              Get AI-powered variations of your content and share them directly to your favorite platforms.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p>Need help? Just reply to this email and we'll be happy to assist you.</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vocero <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Vocero - Let's Get Started! 🎉",
        html: welcomeHtml,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Welcome email sent successfully:', data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const error = await res.text();
      console.error('Error sending welcome email:', error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error in welcome-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);