import React from 'react';

interface JempolHospitalLogoProps {
  className?: string;
  size?: number;
}

const JempolHospitalLogo: React.FC<JempolHospitalLogoProps> = ({ 
  className = '', 
  size = 200 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="url(#gradient1)" />
      
      {/* Medical Cross */}
      <g transform="translate(100, 100)">
        {/* Vertical bar */}
        <rect x="-15" y="-50" width="30" height="100" rx="8" fill="white" />
        {/* Horizontal bar */}
        <rect x="-50" y="-15" width="100" height="30" rx="8" fill="white" />
      </g>
      
      {/* Credit Card Icon */}
      <g transform="translate(100, 140)">
        <rect x="-30" y="-12" width="60" height="40" rx="4" fill="#10b981" stroke="white" strokeWidth="2" />
        <rect x="-30" y="-8" width="60" height="8" fill="white" opacity="0.5" />
        <rect x="-25" y="8" width="20" height="4" rx="2" fill="white" />
        <rect x="-25" y="16" width="35" height="3" rx="1.5" fill="white" opacity="0.7" />
      </g>
      
      {/* Pulse Line */}
      <path
        d="M 30 60 L 50 60 L 60 40 L 70 80 L 80 60 L 100 60"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Decorative Dots */}
      <circle cx="160" cy="50" r="4" fill="white" opacity="0.6" />
      <circle cx="170" cy="70" r="3" fill="white" opacity="0.4" />
      <circle cx="40" cy="140" r="4" fill="white" opacity="0.6" />
      <circle cx="30" cy="160" r="3" fill="white" opacity="0.4" />
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default JempolHospitalLogo;
