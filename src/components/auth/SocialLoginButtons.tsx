import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export const SocialLoginButtons = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState({ linkedin: false, twitter: false });

  // Get the current URL for redirect
  const redirectUrl = `${window.location.origin}/auth/v1/callback`;

  const handleLinkedInLogin = async () => {
    if (isLoading.linkedin) return;
    setIsLoading(prev => ({ ...prev, linkedin: true }));
    
    try {
      console.log('Starting LinkedIn OAuth process...');
      console.log('Using redirect URL:', redirectUrl);
      console.log('Current origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          scopes: 'w_member_social',
          queryParams: {
            auth_type: 'reauthenticate',
            debug_source: 'vocero',
            debug_time: new Date().toISOString(),
            redirect_uri: redirectUrl
          },
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
          cause: error.cause
        });
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No OAuth URL received from Supabase');
        console.error('Response data:', data);
        toast({
          title: "Error",
          description: "Failed to initiate LinkedIn login",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully received OAuth URL from Supabase');
      console.log('Full OAuth URL:', data.url);
      
      // Add debug parameters
      const urlWithDebug = new URL(data.url);
      urlWithDebug.searchParams.append('debug_source', 'vocero');
      urlWithDebug.searchParams.append('debug_time', new Date().toISOString());
      urlWithDebug.searchParams.append('redirect_uri', redirectUrl);
      console.log('Final redirect URL:', urlWithDebug.toString());
      
      window.location.href = urlWithDebug.toString();
      
    } catch (error) {
      console.error('Unexpected error in LinkedIn login:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
      console.error('Full error object:', JSON.stringify(error, null, 2));
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
      console.log('Current origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            debug_source: 'vocero',
            debug_time: new Date().toISOString(),
            redirect_uri: redirectUrl
          }
        }
      });

      if (error) {
        console.error('Twitter OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
          cause: error.cause
        });
        throw error;
      }

      if (!data?.url) {
        console.error('No OAuth URL received from Twitter');
        console.error('Response data:', data);
        throw new Error('No OAuth URL received');
      }

      console.log('Successfully received OAuth URL from Supabase');
      console.log('Full OAuth URL:', data.url);
      
      // Add debug parameters
      const urlWithDebug = new URL(data.url);
      urlWithDebug.searchParams.append('debug_source', 'vocero');
      urlWithDebug.searchParams.append('debug_time', new Date().toISOString());
      urlWithDebug.searchParams.append('redirect_uri', redirectUrl);
      console.log('Final redirect URL:', urlWithDebug.toString());
      
      window.location.href = urlWithDebug.toString();
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to connect to Twitter",
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