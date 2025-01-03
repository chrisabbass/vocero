import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";
  const { toast } = useToast();

  const handleBackToHome = () => {
    navigate("/");
  };

  useEffect(() => {
    // Single subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          const isNewUser = session.user.created_at === session.user.last_sign_in_at;
          
          if (isNewUser) {
            console.log('New user signed up:', session.user.email);
            toast({
              title: "Welcome to Vocero! 🎉",
              description: "Your account has been created successfully.",
            });
            
            try {
              // Only attempt to send welcome email for new users
              const { error: welcomeError } = await supabase.functions.invoke('welcome-email', {
                body: { email: session.user.email }
              });
              
              if (welcomeError) {
                console.error('Welcome email error:', welcomeError);
              } else {
                console.log('Welcome email sent successfully');
              }
            } catch (error) {
              console.error('Failed to send welcome email:', error);
            }
          } else {
            console.log('Existing user signed in:', session.user.email);
            toast({
              title: "Welcome back! 👋",
              description: "You've successfully signed in.",
            });
          }
          
          // Navigate after all operations are complete
          navigate(from);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate, from]);

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

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600">1</span>
            </div>
            <p className="text-sm">Track performance across social platforms</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600">2</span>
            </div>
            <p className="text-sm">View detailed engagement metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600">3</span>
            </div>
            <p className="text-sm">Get insights on your best performing content</p>
          </div>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;