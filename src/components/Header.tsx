import React from 'react';
import { Speech } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header = ({ onLogoClick }: HeaderProps) => {
  return (
    <div className="text-center">
      <h1 
        className="text-4xl font-bold italic mb-2 flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
        style={{ fontFamily: 'Inter', letterSpacing: '-0.025em' }}
        onClick={onLogoClick}
        role="button"
        aria-label="Reset to home"
      >
        <Speech className="w-8 h-8 text-purple-600" />
        Vocero
      </h1>
      <p className="text-slate-600 mb-6">Transform Voice to Influence</p>
    </div>
  );
};

export default Header;