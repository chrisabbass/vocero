import React from 'react';
import { X } from 'lucide-react';

interface ValidationRequirement {
  id: string;
  text: string;
}

const validationRequirements: ValidationRequirement[] = [
  { id: 'length', text: 'At least 8 characters' },
  { id: 'uppercase', text: 'At least one uppercase letter' },
  { id: 'lowercase', text: 'At least one lowercase letter' },
  { id: 'number', text: 'At least one number' },
  { id: 'special', text: 'At least one special character' }
];

export const PasswordValidation: React.FC = () => {
  const setupPasswordValidation = () => {
    const observer = new MutationObserver((mutations) => {
      // Check if we're on the sign-up view
      const signUpForm = document.querySelector('form[data-supabase-auth-view="sign_up"]');
      const container = document.getElementById('password-validation-container');
      
      if (signUpForm && container) {
        // Only setup validation if we're on sign-up view
        const passwordInput = signUpForm.querySelector('input[type="password"]') as HTMLInputElement;
        if (passwordInput && !passwordInput.dataset.validationAttached) {
          passwordInput.dataset.validationAttached = 'true';
          passwordInput.addEventListener('input', validatePassword);
          // Move validation requirements into the container
          container.innerHTML = ''; // Clear any existing content
          container.appendChild(document.getElementById('password-requirements') || document.createElement('div'));
        }
      } else if (container) {
        // Clear validation if not on sign-up
        container.innerHTML = '';
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  };

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

  React.useEffect(() => {
    const observer = setupPasswordValidation();
    return () => observer.disconnect();
  }, []);

  return (
    <div id="password-requirements" className="mt-2 space-y-1 text-sm">
      {validationRequirements.map((req) => (
        <div
          key={req.id}
          id={`validation-${req.id}`}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span className="validation-icon w-4 h-4 flex items-center justify-center">
            <X className="h-3 w-3 text-destructive" />
          </span>
          <span>{req.text}</span>
        </div>
      ))}
    </div>
  );
};