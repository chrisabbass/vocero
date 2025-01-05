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
      const { data: tokens } = await supabase
        .from('user_social_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'twitter')
        .maybeSingle();

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

      // Create state parameter with user ID
      const state = JSON.stringify({
        userId: user.id,
        redirectTo: '/schedule'
      });

      console.log('Initiating Twitter OAuth flow');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback`,
          scopes: 'tweet.write tweet.read users.read offline.access',
          queryParams: {
            state
          }
        }
      });

      if (error) {
        throw error;
      }

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