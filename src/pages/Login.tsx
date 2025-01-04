import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google login error:", {
          status: error.status,
          message: error.message,
          name: error.name,
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Login error:", {
        error,
        message: error?.message,
        name: error?.name,
        status: error?.status,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Login Error",
        description: error?.message || "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    console.log("Login attempt started for:", email);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Using redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("Supabase auth error:", {
          code: error.status,
          message: error.message,
          name: error.name,
        });
        throw error;
      }

      console.log("Magic link request successful:", {
        data,
        email,
        timestamp: new Date().toISOString(),
      });

      setEmail("");
      toast({
        title: "Magic link sent! 🪄",
        description: "Check your email for the login link.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Login error:", {
        error,
        message: error?.message,
        name: error?.name,
        status: error?.status,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Login Error",
        description: error?.message || "There was a problem sending the magic link. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change detected:", {
        event,
        email: session?.user?.email,
        timestamp: new Date().toISOString(),
      });

      if (event === "SIGNED_IN" && session) {
        const isNewUser = session.user.created_at === session.user.last_sign_in_at;
        
        toast({
          title: isNewUser ? "Welcome to Vocero! 🎉" : "Welcome back! 👋",
          description: isNewUser 
            ? "Your account has been created successfully."
            : "You've successfully signed in.",
        });

        navigate(from);
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

        {/* Google Sign In Button */}
        <Button 
          variant="outline" 
          className="w-full mb-4 flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Mail className="w-4 h-4" />
            {loading ? "Sending magic link..." : "Send magic link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;