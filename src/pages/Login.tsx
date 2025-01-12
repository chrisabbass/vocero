import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import { LoginFeatures } from "@/components/auth/LoginFeatures";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const from = location.state?.from || "/";

  useEffect(() => {
    console.log('Login page mounted, setting up auth listeners');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);
    
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      // Check for hash parameters (used by some OAuth providers)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get('error');
      const hashErrorDescription = hashParams.get('error_description');

      // Check for query parameters (used by other OAuth providers)
      const queryParams = new URLSearchParams(window.location.search);
      const queryError = queryParams.get('error');
      const queryErrorDescription = queryParams.get('error_description');
      const code = queryParams.get('code');

      console.log('OAuth callback parameters:', {
        hashError,
        hashErrorDescription,
        queryError,
        queryErrorDescription,
        hasCode: !!code
      });

      // Handle any OAuth errors
      if (hashError || queryError) {
        const errorMessage = hashErrorDescription || queryErrorDescription || "Failed to authenticate";
        console.error('OAuth callback error:', { hashError, queryError, errorMessage });
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // If we have a code, exchange it for a session
      if (code) {
        console.log('Received OAuth code, exchanging for session...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.session) {
          console.log('Successfully exchanged code for session');
          toast({
            title: "Success",
            description: "Successfully authenticated",
          });
          navigate(from);
        }
      }
    };

    // Check if user is already authenticated
    const checkAuth = async () => {
      console.log('Checking initial auth state...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth session:', error);
        toast({
          title: "Authentication Error",
          description: "There was an error checking your authentication status.",
          variant: "destructive",
        });
        return;
      }
      if (session) {
        console.log('User already authenticated, redirecting to:', from);
        navigate(from);
      }
    };

    handleAuthCallback();
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'none');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully, redirecting to:', from);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate(from);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [navigate, from, toast]);

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <button
        onClick={handleBackToHome}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </button>

      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-2">
          {from === "/analytics" ? "Unlock Analytics Features!" : "Welcome Back!"}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {from === "/analytics" 
            ? "Sign in to access detailed analytics and track your content performance"
            : "Sign in to save your recordings and access analytics"}
        </p>

        <LoginFeatures from={from} />
        
        <SocialLoginButtons />

        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { background: 'rgb(147 51 234)', color: 'white' },
              anchor: { color: 'rgb(147 51 234)' },
            },
          }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
        />

        <div id="password-validation-container">
          <PasswordValidation />
        </div>
      </div>
    </div>
  );
};

export default Login;