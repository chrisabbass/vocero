import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const SocialLoginButtons = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState({ linkedin: false, twitter: false });

  const handleLinkedInLogin = async () => {
    if (isLoading.linkedin) return;
    setIsLoading(prev => ({ ...prev, linkedin: true }));
    
    try {
      console.log('[LinkedIn OAuth] Starting authentication process');
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('[LinkedIn OAuth] Using redirect URL:', redirectUrl);
      
      try {
        console.log('[LinkedIn OAuth] Invoking edge function');
        const { data: functionData, error: functionError } = await supabase.functions.invoke('linkedin-oauth', {
          body: { redirectUrl }
        });

        if (functionError) {
          console.error('[LinkedIn OAuth] Edge function error:', functionError);
          throw new Error(functionError.message);
        }

        if (!functionData?.url) {
          console.error('[LinkedIn OAuth] No URL received from edge function');
          throw new Error('Failed to get authorization URL');
        }

        console.log('[LinkedIn OAuth] Redirecting to:', functionData.url);
        window.location.href = functionData.url;
      } catch (functionError) {
        console.error('[LinkedIn OAuth] Failed to invoke edge function:', functionError);
        throw functionError;
      }
    } catch (error) {
      console.error('[LinkedIn OAuth] Unexpected error:', error);
      toast({
        title: "LinkedIn Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  const handleTwitterLogin = async () => {
    if (isLoading.twitter) return;
    setIsLoading(prev => ({ ...prev, twitter: true }));
    
    try {
      console.log('[Twitter OAuth] Starting authentication process');
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('[Twitter OAuth] Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          scopes: 'tweet.write tweet.read users.read offline.access',
          queryParams: {
            prompt: 'consent'
          }
        }
      });

      console.log('[Twitter OAuth] Response:', { data, error });

      if (error) {
        console.error('[Twitter OAuth] Error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast({
          title: "Twitter Authentication Error",
          description: error.message || "Failed to connect to Twitter. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('[Twitter OAuth] No URL received');
        toast({
          title: "Twitter Error",
          description: "Failed to initiate Twitter login. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Store user ID in state parameter for the callback
      const state = JSON.stringify({
        userId: (await supabase.auth.getUser()).data.user?.id,
        returnTo: window.location.pathname
      });

      // Append state to the OAuth URL
      const finalUrl = new URL(data.url);
      finalUrl.searchParams.set('state', state);

      console.log('[Twitter OAuth] Redirecting to:', finalUrl.toString());
      window.location.href = finalUrl.toString();
      
    } catch (error) {
      console.error('[Twitter OAuth] Unexpected error:', error);
      toast({
        title: "Twitter Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, twitter: false }));
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <Button
        variant="outline"
        onClick={handleLinkedInLogin}
        className="w-full flex items-center gap-2"
        disabled={isLoading.linkedin}
      >
        <Linkedin className="h-4 w-4" />
        {isLoading.linkedin ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}
      </Button>
      <Button
        variant="outline"
        onClick={handleTwitterLogin}
        className="w-full flex items-center gap-2"
        disabled={isLoading.twitter}
      >
        <Twitter className="h-4 w-4" />
        {isLoading.twitter ? 'Connecting to Twitter...' : 'Continue with Twitter'}
      </Button>
    </div>
  );
};
