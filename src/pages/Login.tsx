import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const from = location.state?.from || "/";

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth session:', error);
        return;
      }
      if (session) {
        console.log('User already authenticated, redirecting to:', from);
        navigate(from);
      }
    };

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
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });

    // Add password validation listener
    const setupPasswordValidation = () => {
      const observer = new MutationObserver((mutations) => {
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput && !passwordInput.dataset.validationAttached) {
          passwordInput.dataset.validationAttached = 'true';
          passwordInput.addEventListener('input', validatePassword);
          
          // Create validation container if it doesn't exist
          if (!document.getElementById('password-requirements')) {
            const container = passwordInput.parentElement;
            const requirementsDiv = document.createElement('div');
            requirementsDiv.id = 'password-requirements';
            requirementsDiv.className = 'mt-2 space-y-1 text-sm';
            
            const validations = [
              { id: 'length', text: 'At least 8 characters' },
              { id: 'uppercase', text: 'At least one uppercase letter' },
              { id: 'lowercase', text: 'At least one lowercase letter' },
              { id: 'number', text: 'At least one number' },
              { id: 'special', text: 'At least one special character' }
            ];

            validations.forEach(validation => {
              const requirement = document.createElement('div');
              requirement.id = `validation-${validation.id}`;
              requirement.className = 'flex items-center gap-2 text-muted-foreground';
              requirement.innerHTML = `
                <span class="validation-icon w-4 h-4 flex items-center justify-center">
                  <X class="h-3 w-3 text-destructive" />
                </span>
                <span>${validation.text}</span>
              `;
              requirementsDiv.appendChild(requirement);
            });

            if (container) {
              container.appendChild(requirementsDiv);
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    const observer = setupPasswordValidation();

    // Cleanup subscription and event listeners
    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
      observer.disconnect();
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.removeEventListener('input', validatePassword);
      }
    };
  }, [navigate, from, toast]);

  const validatePassword = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const password = input.value;
    
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.entries(requirements).forEach(([key, isValid]) => {
      const element = document.querySelector(`#validation-${key}`);
      if (element) {
        element.className = `flex items-center gap-2 ${isValid ? 'text-green-500' : 'text-muted-foreground'}`;
        const icon = element.querySelector('.validation-icon');
        if (icon) {
          icon.innerHTML = isValid 
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        }
      }
    });
  };

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
      </div>
    </div>
  );
};

export default Login;