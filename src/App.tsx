import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Login = lazy(() => import("./pages/Login"));
const Inspo = lazy(() => import("./pages/Inspo"));
const Schedule = lazy(() => import("./pages/Schedule"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    },
  },
});

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Protected route wrapper for routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth status:', error);
      }
      console.log('Session status:', session ? 'Active' : 'No session');
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, 'Session:', session ? 'Active' : 'None');
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    console.log('Authentication status still loading...');
    return <LoadingSpinner />;
  }

  console.log('Final auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  return isAuthenticated ? 
    <>{children}</> : 
    <Navigate to="/login" state={{ from: '/analytics' }} replace />;
};

const App = () => {
  console.log('App component rendering');
  
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Auth session check:', session ? 'Active session' : 'No session');
        
        if (session) {
          const { data, error } = await supabase.from('profiles').select('*').limit(1);
          console.log('Supabase connection test:', error ? 'Failed' : 'Successful');
          if (error) console.error('Supabase connection error:', error);
        } else {
          console.log('Skipping profiles check - no authenticated session');
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Main route is public */}
                <Route path="/" element={
                  <>
                    <Navigation />
                    <Index />
                    <Footer />
                  </>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={
                  <>
                    <Navigation />
                    <PrivacyPolicy />
                    <Footer />
                  </>
                } />
                {/* Protected routes */}
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <Analytics />
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
                <Route path="/schedule" element={
                  <ProtectedRoute>
                    <>
                      <Navigation />
                      <Schedule />
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
                <Route path="/inspo" element={
                  <>
                    <Navigation />
                    <Inspo />
                    <Footer />
                  </>
                } />
              </Routes>
            </Suspense>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
