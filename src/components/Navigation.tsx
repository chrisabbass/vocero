import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-background">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 py-4">
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
            to="/analytics"
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
      </div>
    </nav>
  );
};

export default Navigation;