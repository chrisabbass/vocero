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
    
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    console.log("Starting magic link login for:", email);

    try {
      // Create the sign-in request
      const signInResponse = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        }
      });

      // Log the complete response for debugging
      console.log("Complete sign-in response:", JSON.stringify(signInResponse, null, 2));

      // Check for errors in the response
      if (signInResponse.error) {
        throw new Error(signInResponse.error.message);
      }

      // Success case
      toast({
        title: "Magic link sent! 🪄",
        description: "Check your email for the login link.",
        duration: 5000,
      });
      
      setEmail("");
      
    } catch (error: any) {
      console.error("Login error details:", {
        error,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: "Error",
        description: "There was a problem sending the magic link. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);

      if (event === "SIGNED_IN" && session) {
        console.log("User signed in successfully:", session.user.email);
        
        const isNewUser = session.user.created_at === session.user.last_sign_in_at;
        
        if (isNewUser) {
          toast({
            title: "Welcome to Vocero! 🎉",
            description: "Your account has been created successfully.",
          });
        } else {
          toast({
            title: "Welcome back! 👋",
            description: "You've successfully signed in.",
          });
        }

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
              disabled={loading}
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