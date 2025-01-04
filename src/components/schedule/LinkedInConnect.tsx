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

      // Store the current URL to redirect back after OAuth
      localStorage.setItem('linkedin_redirect', window.location.pathname);

      console.log('Initiating LinkedIn OAuth flow for user:', user.id);
      
      // Get the anon key from the Supabase client
      const anonKey = supabase.supabaseKey;
      console.log('Using Supabase anon key:', anonKey ? 'Present' : 'Missing');

      // Create state parameter with user ID and anon key
      const stateParam = JSON.stringify({
        userId: user.id,
        key: anonKey
      });

      // Redirect to LinkedIn OAuth with only w_member_social scope
      const linkedinUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      linkedinUrl.searchParams.append('response_type', 'code');
      linkedinUrl.searchParams.append('client_id', '780umlz9pwq8w4');
      linkedinUrl.searchParams.append('redirect_uri', 'https://nmjmurbaaevmakymqiyc.supabase.co/auth/v1/callback');
      linkedinUrl.searchParams.append('state', stateParam);
      linkedinUrl.searchParams.append('scope', 'w_member_social');

      console.log('Redirecting to LinkedIn with URL:', linkedinUrl.toString());
      window.location.href = linkedinUrl.toString();
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