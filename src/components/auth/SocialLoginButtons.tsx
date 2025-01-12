import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";

type OAuthResponse = {
  data: { url: string } | null;
  error: AuthError | null;
};

export const SocialLoginButtons = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState({ linkedin: false, twitter: false });

  // Use the preview URL for redirect
  const redirectUrl = 'https://vocero.lovable.app/auth/callback';
  
  const handleLinkedInLogin = async () => {
    if (isLoading.linkedin) return;
    setIsLoading(prev => ({ ...prev, linkedin: true }));
    
    try {
      console.log('Starting LinkedIn OAuth process...');
      console.log('Using redirect URL:', redirectUrl);
      
      const timeoutPromise = new Promise<OAuthResponse>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });

      const authPromise = supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          scopes: 'w_member_social',
          redirectTo: redirectUrl,
          queryParams: {
            auth_type: 'reauthenticate'
          }
        }
      });

      const { data, error } = await Promise.race([authPromise, timeoutPromise])
        .catch((error: Error): OAuthResponse => {
          console.error('LinkedIn OAuth error:', error);
          if (error.message === 'Request timed out') {
            return { 
              data: null, 
              error: { 
                message: 'Connection timed out. Please try again.',
                name: 'TimeoutError',
                status: 408
              } as AuthError 
            };
          }
          return { 
            data: null, 
            error: error as AuthError 
          };
        });

      if (error) {
        console.error('LinkedIn OAuth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to connect to LinkedIn. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No OAuth URL received from Supabase');
        toast({
          title: "Error",
          description: "Failed to initiate LinkedIn login. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully received OAuth URL:', data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Unexpected error in LinkedIn login:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(prev => ({ ...prev, linkedin: false }));
      }, 1000);
    }
  };

  const handleTwitterLogin = async () => {
    if (isLoading.twitter) return;
    setIsLoading(prev => ({ ...prev, twitter: true }));
    
    try {
      console.log('Initiating Twitter OAuth login...');
      console.log('Using redirect URL:', redirectUrl);
      
      const timeoutPromise = new Promise<OAuthResponse>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });

      const authPromise = supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          scopes: 'tweet.write tweet.read users.read offline.access'
        }
      });

      const { data, error } = await Promise.race([authPromise, timeoutPromise])
        .catch((error: Error): OAuthResponse => {
          console.error('Twitter OAuth error:', error);
          if (error.message === 'Request timed out') {
            return { 
              data: null, 
              error: { 
                message: 'Connection timed out. Please try again.',
                name: 'TimeoutError',
                status: 408
              } as AuthError 
            };
          }
          return { 
            data: null, 
            error: error as AuthError 
          };
        });

      if (error) {
        console.error('Twitter OAuth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to connect to Twitter. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No OAuth URL received from Twitter');
        toast({
          title: "Error",
          description: "Failed to initiate Twitter login. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully received OAuth URL:', data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(prev => ({ ...prev, twitter: false }));
      }, 1000);
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
        {isLoading.linkedin ? 'Connecting...' : 'Continue with LinkedIn'}
      </Button>
      <Button
        variant="outline"
        onClick={handleTwitterLogin}
        className="w-full flex items-center gap-2"
        disabled={isLoading.twitter}
      >
        <Twitter className="h-4 w-4" />
        {isLoading.twitter ? 'Connecting...' : 'Continue with Twitter'}
      </Button>
    </div>
  );
};