import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const SocialLoginButtons = () => {
  const { toast } = useToast();

  const handleLinkedInLogin = async () => {
    try {
      console.log('Initiating LinkedIn OAuth login...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          scopes: 'w_member_social',
          queryParams: {
            auth_type: 'reauthenticate'
          },
          skipBrowserRedirect: true // This enables popup behavior
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening LinkedIn OAuth popup...');
        // Open the OAuth URL in a popup
        const popup = window.open(
          data.url,
          'Login with LinkedIn',
          'width=600,height=700,left=200,top=100'
        );

        // Handle popup closure
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            console.log('LinkedIn popup closed');
            clearInterval(checkPopup);
            // Check if the user was authenticated
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                console.log('Successfully authenticated with LinkedIn');
                toast({
                  title: "Success!",
                  description: "Successfully logged in with LinkedIn",
                });
              }
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      toast({
        title: "Error",
        description: "Failed to connect to LinkedIn",
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
          skipBrowserRedirect: true // This enables popup behavior
        }
      });

      if (error) {
        console.error('Twitter OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening Twitter OAuth popup...');
        // Open the OAuth URL in a popup
        const popup = window.open(
          data.url,
          'Login with Twitter',
          'width=600,height=700,left=200,top=100'
        );

        // Handle popup closure
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            console.log('Twitter popup closed');
            clearInterval(checkPopup);
            // Check if the user was authenticated
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                console.log('Successfully authenticated with Twitter');
                toast({
                  title: "Success!",
                  description: "Successfully logged in with Twitter",
                });
              }
            });
          }
        }, 500);
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