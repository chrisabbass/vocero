import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Attempting to send magic link to:", email);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://www.vocero.ai/auth/callback'
        }
      });

      if (error) {
        console.error("Magic link error:", error);
        throw error;
      }

      console.log("Magic link sent successfully");
      
      toast({
        title: "Magic link sent! 🪄",
        description: "Check your email for the login link.",
        duration: 5000,
      });
      
      setEmail("");
      
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const isNewUser = session.user.created_at === session.user.last_sign_in_at;
          
          if (isNewUser) {
            console.log("New user signed up:", session.user.email);
            toast({
              title: "Welcome to Vocero! 🎉",
              description: "Your account has been created successfully.",
            });
          } else {
            console.log("Existing user signed in:", session.user.email);
            toast({
              title: "Welcome back! 👋",
              description: "You've successfully signed in.",
            });
          }

          navigate(from);
        } catch (error) {
          console.error("Error during sign in process:", error);
          toast({
            title: "Error",
            description: "There was an error during the sign in process. Please try again.",
            variant: "destructive",
          });
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
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Sending magic link..." : "Send magic link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;