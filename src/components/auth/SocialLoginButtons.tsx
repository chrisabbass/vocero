import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const SocialLoginButtons = () => {
  const { toast } = useToast();

  const handleLinkedInLogin = async () => {
    try {
      console.log('Starting LinkedIn OAuth process...');
      
      // First check if LinkedIn provider is configured
      const { data: { providers }, error: providersError } = await supabase.auth.getProviders();
      console.log('Available auth providers:', providers);
      
      if (providersError) {
        console.error('Error fetching providers:', providersError);
        throw new Error('Could not verify available authentication providers');
      }

      if (!providers?.includes('linkedin')) {
        console.error('LinkedIn provider is not enabled in Supabase');
        toast({
          title: "Configuration Error",
          description: "LinkedIn authentication is not properly configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('Initiating LinkedIn OAuth sign-in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          scopes: 'w_member_social',
          queryParams: {
            auth_type: 'reauthenticate'
          },
          skipBrowserRedirect: true
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
      const popup = window.open(
        data.url,
        'Login with LinkedIn',
        'width=600,height=700,left=200,top=100'
      );

      if (!popup) {
        console.error('Popup was blocked by browser');
        toast({
          title: "Error",
          description: "Please allow popups for this site to login with LinkedIn",
          variant: "destructive",
        });
        return;
      }

      const checkPopup = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            console.log('LinkedIn popup closed, checking authentication status...');
            clearInterval(checkPopup);
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Error checking session after popup close:', sessionError);
              throw sessionError;
            }

            if (session) {
              console.log('Successfully authenticated with LinkedIn');
              toast({
                title: "Success!",
                description: "Successfully logged in with LinkedIn",
              });
            } else {
              console.log('No session found after popup close');
              toast({
                title: "Login Incomplete",
                description: "LinkedIn login was not completed",
                variant: "destructive",
              });
            }
          }
        } catch (checkError) {
          console.error('Error in popup check interval:', checkError);
          clearInterval(checkPopup);
          toast({
            title: "Error",
            description: "An error occurred during login",
            variant: "destructive",
          });
        }
      }, 500);
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