import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const SocialLoginButtons = () => {
  const { toast } = useToast();

  const handleLinkedInLogin = async () => {
    try {
      console.log('Starting LinkedIn OAuth process...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          scopes: 'w_member_social',
          queryParams: {
            auth_type: 'reauthenticate'
          },
          redirectTo: `${window.location.origin}/schedule`
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No OAuth URL received from Supabase');
        toast({
          title: "Error",
          description: "Failed to initiate LinkedIn login",
          variant: "destructive",
        });
        return;
      }

      console.log('Opening LinkedIn OAuth popup with URL:', data.url);
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Unexpected error in LinkedIn login:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTwitterLogin = async () => {
    try {
      console.log('Initiating Twitter OAuth login...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/schedule`
        }
      });

      if (error) {
        console.error('Twitter OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening Twitter OAuth URL:', data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Twitter",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <Button
        variant="outline"
        onClick={handleLinkedInLogin}
        className="w-full flex items-center gap-2"
      >
        <Linkedin className="h-4 w-4" />
        Continue with LinkedIn
      </Button>
      <Button
        variant="outline"
        onClick={handleTwitterLogin}
        className="w-full flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        Continue with Twitter
      </Button>
    </div>
  );
};