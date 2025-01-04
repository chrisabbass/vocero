import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center space-x-6 text-sm text-slate-600">
          <Link 
            to="/privacy-policy" 
            className="hover:text-slate-900 transition-colors"
          >
            Privacy Policy
          </Link>
          <p>© {new Date().getFullYear()} Vocero. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;