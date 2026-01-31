import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HistoMed Logo"
    >
      {/* Definitions for Gradients */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" /> {/* medical-400 */}
          <stop offset="100%" stopColor="#0369a1" /> {/* medical-700 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Shape */}
      <rect width="100" height="100" rx="28" fill="url(#logoGradient)" />
      
      {/* Decorative 'Cells' in background */}
      <circle cx="75" cy="25" r="8" fill="white" fillOpacity="0.2" />
      <circle cx="82" cy="40" r="5" fill="white" fillOpacity="0.15" />
      <circle cx="20" cy="80" r="10" fill="white" fillOpacity="0.15" />

      {/* Microscope Silhouette */}
      <g transform="translate(25, 20) scale(0.5)">
         {/* Eyepiece */}
        <rect x="35" y="0" width="30" height="10" rx="2" fill="white" />
        <rect x="40" y="10" width="20" height="20" fill="white" />
        
        {/* Arm / Body */}
        <path d="M40 30 C 40 60, 20 60, 20 90 L 20 100 L 40 100" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none" />
        
        {/* Objective Lens */}
        <path d="M42 50 L 58 50 L 50 70 Z" fill="white" />
        
        {/* Stage */}
        <rect x="25" y="75" width="60" height="6" rx="2" fill="white" />
        
        {/* Base */}
        <path d="M10 110 H 90 C 95 110 95 125 90 125 H 10 C 5 125 5 110 10 110 Z" fill="white" />
        
        {/* Focus Knob */}
        <circle cx="35" cy="55" r="8" fill="white" />
      </g>
    </svg>
  );
};

export default Logo;
