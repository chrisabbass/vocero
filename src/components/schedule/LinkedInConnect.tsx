import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const LinkedInConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkLinkedInConnection();
  }, []);

  const checkLinkedInConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }

      console.log('Checking LinkedIn connection for user:', user.id);
      const { data: tokens, error } = await supabase
        .from('user_social_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .maybeSingle();

      if (error) {
        console.error('Error checking LinkedIn tokens:', error);
        throw error;
      }

      console.log('LinkedIn connection status:', tokens ? 'Connected' : 'Not connected');
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error);
      toast({
        title: "Error",
        description: "Failed to check LinkedIn connection status",
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

      console.log('[LinkedIn OAuth] Starting connection process');
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('[LinkedIn OAuth] Using redirect URL:', redirectUrl);

      try {
        console.log('[LinkedIn OAuth] Invoking edge function');
        const { data: functionData, error: functionError } = await supabase.functions.invoke('linkedin-oauth', {
          body: { redirectUrl, state }
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
      console.error('Error connecting to LinkedIn:', error);
      toast({
        title: "Error",
        description: "Failed to connect to LinkedIn",
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
        <Linkedin className="h-4 w-4" />
        {isConnected ? "Connected to LinkedIn" : "Connect LinkedIn"}
      </Button>
    </div>
  );
};