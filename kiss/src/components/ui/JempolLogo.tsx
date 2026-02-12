interface JempolLogoProps {
  className?: string;
  size?: number;
}

export default function JempolLogo({ className = '', size = 40 }: JempolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="jempolGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="jempolGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="jempolGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        
        {/* Shadow filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#jempolGradient1)" opacity="0.1"/>
      
      {/* Main Thumbs Up Icon - Modern & Futuristic */}
      <g filter="url(#shadow)">
        {/* Thumb */}
        <path
          d="M 35 45 Q 35 35 42 32 Q 48 30 52 35 L 52 25 Q 52 18 58 18 Q 64 18 64 25 L 64 45"
          fill="url(#jempolGradient1)"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Hand base */}
        <rect
          x="28"
          y="45"
          width="36"
          height="28"
          rx="6"
          fill="url(#jempolGradient2)"
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Fingers detail lines */}
        <line x1="38" y1="45" x2="38" y2="73" stroke="white" strokeWidth="1.5" opacity="0.5"/>
        <line x1="48" y1="45" x2="48" y2="73" stroke="white" strokeWidth="1.5" opacity="0.5"/>
        <line x1="58" y1="45" x2="58" y2="73" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      </g>

      {/* Digital/Tech accent lines */}
      <g opacity="0.6">
        <circle cx="50" cy="50" r="42" stroke="url(#jempolGradient3)" strokeWidth="1" fill="none" strokeDasharray="4 4">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="50" r="38" stroke="url(#jempolGradient2)" strokeWidth="1" fill="none" strokeDasharray="2 6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Innovation sparkles */}
      <g fill="url(#jempolGradient3)">
        <circle cx="75" cy="25" r="3">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="25" cy="30" r="2">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="80" cy="70" r="2.5">
          <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}
