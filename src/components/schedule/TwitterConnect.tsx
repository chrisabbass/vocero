import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Twitter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const TwitterConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkTwitterConnection();
  }, []);

  const checkTwitterConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }

      console.log('Checking Twitter connection for user:', user.id);
      const { data: tokens, error } = await supabase
        .from('user_social_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'twitter')
        .maybeSingle();

      if (error) {
        console.error('Error checking Twitter tokens:', error);
        throw error;
      }

      console.log('Twitter connection status:', tokens ? 'Connected' : 'Not connected');
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking Twitter connection:', error);
      toast({
        title: "Error",
        description: "Failed to check Twitter connection status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in first",
          variant: "destructive",
        });
        return;
      }

      // Store the current URL to redirect back after OAuth
      localStorage.setItem('twitter_redirect', window.location.pathname);

      console.log('Initiating Twitter OAuth flow for user:', user.id);
      
      // Create state parameter with user ID
      const stateParam = JSON.stringify({
        userId: user.id
      });

      // Redirect to Twitter OAuth
      const twitterUrl = new URL('https://twitter.com/i/oauth2/authorize');
      twitterUrl.searchParams.append('response_type', 'code');
      twitterUrl.searchParams.append('client_id', '780umlz9pwq8w4');
      twitterUrl.searchParams.append('redirect_uri', 'https://nmjmurbaaevmakymqiyc.supabase.co/auth/v1/callback');
      twitterUrl.searchParams.append('state', stateParam);
      twitterUrl.searchParams.append('scope', 'tweet.write tweet.read users.read offline.access');
      twitterUrl.searchParams.append('code_challenge', 'challenge');
      twitterUrl.searchParams.append('code_challenge_method', 'plain');

      console.log('Redirecting to Twitter with URL:', twitterUrl.toString());
      window.location.href = twitterUrl.toString();
    } catch (error) {
      console.error('Error connecting to Twitter:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Twitter",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mb-4">
      <Button
        variant={isConnected ? "secondary" : "default"}
        onClick={handleConnect}
        className="flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        {isConnected ? "Connected to Twitter" : "Connect Twitter"}
      </Button>
    </div>
  );
};