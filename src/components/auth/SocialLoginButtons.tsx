import { Button } from "@/components/ui/button";
import { Linkedin, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const SocialLoginButtons = () => {
  const { toast } = useToast();

  const handleLinkedInLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/schedule`,
          scopes: 'w_member_social',
          queryParams: {
            auth_type: 'reauthenticate'
          }
        }
      });

      if (error) throw error;
      console.log('LinkedIn OAuth initiated:', data);
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/schedule`,
          queryParams: {
            auth_type: 'reauthenticate'
          }
        }
      });

      if (error) throw error;
      console.log('Twitter OAuth initiated:', data);
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