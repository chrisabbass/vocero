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
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.addEventListener('input', validatePassword);
    }

    checkAuth();

    // Cleanup subscription and event listeners
    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.removeEventListener('input', validatePassword);
      }
    };
  }, [navigate, from, toast]);

  const validatePassword = (event) => {
    const password = event.target.value;
    const requirements = document.getElementById('password-requirements');
    
    if (!requirements) {
      const container = event.target.parentElement;
      const newRequirements = document.createElement('div');
      newRequirements.id = 'password-requirements';
      newRequirements.className = 'mt-2';
      container.appendChild(newRequirements);
      
      // Create validation alerts
      const validations = [
        { id: 'length', text: 'At least 8 characters' },
        { id: 'uppercase', text: 'At least one uppercase letter' },
        { id: 'lowercase', text: 'At least one lowercase letter' },
        { id: 'number', text: 'At least one number' },
        { id: 'special', text: 'At least one special character' }
      ];

      validations.forEach(validation => {
        const alert = document.createElement('div');
        alert.id = `validation-${validation.id}`;
        alert.className = 'flex items-center space-x-2 text-sm mb-1';
        alert.innerHTML = `
          <span class="validation-icon w-4 h-4"></span>
          <span>${validation.text}</span>
        `;
        newRequirements.appendChild(alert);
      });
    }

    // Update validation status
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    updateValidationStatus('length', hasLength);
    updateValidationStatus('uppercase', hasUppercase);
    updateValidationStatus('lowercase', hasLowercase);
    updateValidationStatus('number', hasNumber);
    updateValidationStatus('special', hasSpecial);
  };

  const updateValidationStatus = (id, isValid) => {
    const element = document.querySelector(`#validation-${id} .validation-icon`);
    if (element) {
      element.innerHTML = isValid 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    }
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