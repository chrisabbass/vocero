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
      if (!user) return;

      const { data: tokens } = await supabase
        .from('user_social_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .single();

      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error checking LinkedIn connection:', error);
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

      // Redirect to LinkedIn OAuth
      const linkedinUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      linkedinUrl.searchParams.append('response_type', 'code');
      linkedinUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID || '');
      linkedinUrl.searchParams.append('redirect_uri', `${window.location.origin}/functions/v1/linkedin-oauth`);
      linkedinUrl.searchParams.append('state', user.id);
      linkedinUrl.searchParams.append('scope', 'w_member_social');

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