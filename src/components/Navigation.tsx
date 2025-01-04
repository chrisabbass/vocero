import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Home, LogOut, LogIn, Lightbulb, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleAnalyticsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Analytics clicked, authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/analytics' } });
    } else {
      navigate('/analytics');
    }
  };

  return (
    <div className="w-full bg-slate-50">
      <nav className="bg-slate-50 border-none">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/inspo"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/inspo'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                <span>Inspo</span>
              </Link>
              {isAuthenticated && (
                <Link
                  to="/schedule"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === '/schedule'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </Link>
              )}
              <Link
                to="/analytics"
                onClick={handleAnalyticsClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/analytics'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </div>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogin}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;