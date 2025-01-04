import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import { LoginFeatures } from "@/components/auth/LoginFeatures";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const from = location.state?.from || "/";

  useEffect(() => {
    console.log('Login page mounted, setting up auth listeners');
    
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
          onAuthError={(error) => {
            console.error('Auth error:', error);
            toast({
              title: "Authentication Error",
              description: error.message || "An error occurred during authentication",
              variant: "destructive",
            });
          }}
        />

        <PasswordValidation />
      </div>
    </div>
  );
};

export default Login;