import React from 'react';

interface HeroInsigniaIconProps {
  type: string;
  className?: string;
  color?: string;
}

export const HeroInsigniaIcon: React.FC<HeroInsigniaIconProps> = ({
  type,
  className = 'w-6 h-6',
  color = 'currentColor',
}) => {
  switch (type) {
    case 'black-panther':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth="4">
          <path
            d="M20 30 L32 15 L40 25 L60 25 L68 15 L80 30 C86 45 84 75 50 90 C16 75 14 45 20 30 Z"
            fill={color}
            fillOpacity="0.2"
          />
          <path d="M30 45 L42 50 L35 55 Z" fill={color} />
          <path d="M70 45 L58 50 L65 55 Z" fill={color} />
          <path d="M44 65 L50 72 L56 65 Z" fill={color} />
          <circle cx="50" cy="36" r="3" fill={color} />
        </svg>
      );

    case 'captain-america':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#dc2626" />
          <circle cx="50" cy="50" r="36" fill="#f8fafc" />
          <circle cx="50" cy="50" r="26" fill="#dc2626" />
          <circle cx="50" cy="50" r="16" fill="#2563eb" />
          <polygon
            points="50,38 53,46 62,46 55,51 58,60 50,55 42,60 45,51 38,46 47,46"
            fill="#ffffff"
          />
        </svg>
      );

    case 'iron-man':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="45" fill="#18181b" stroke="#eab308" strokeWidth="4" />
          <polygon points="50,22 75,65 25,65" stroke="#38bdf8" strokeWidth="5" fill="#0284c7" fillOpacity="0.4" />
          <circle cx="50" cy="51" r="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" />
        </svg>
      );

    case 'spider-man':
      return (
        <svg viewBox="0 0 100 100" className={className} fill={color}>
          <ellipse cx="50" cy="45" rx="9" ry="12" />
          <ellipse cx="50" cy="62" rx="12" ry="16" />
          {/* 8 spider legs */}
          <path d="M44 42 Q30 25 15 32 Q25 45 42 46" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M56 42 Q70 25 85 32 Q75 45 58 46" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M42 48 Q20 40 10 52 Q22 58 40 54" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M58 48 Q80 40 90 52 Q78 58 60 54" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M42 58 Q15 65 18 85 Q30 75 44 65" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M58 58 Q85 65 82 85 Q70 75 56 65" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'deadpool':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#dc2626" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="#18181b" strokeWidth="7" />
          <path d="M44 26 C28 26 22 40 22 50 C22 65 30 74 44 74 Z" fill="#18181b" />
          <path d="M56 26 C72 26 78 40 78 50 C78 65 70 74 56 74 Z" fill="#18181b" />
          <circle cx="34" cy="50" r="4.5" fill="#ffffff" />
          <circle cx="66" cy="50" r="4.5" fill="#ffffff" />
        </svg>
      );

    case 'wolverine':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="#18181b">
          <circle cx="50" cy="50" r="46" fill="#f59e0b" />
          <path d="M22 25 L38 55 L35 75 L50 85 L65 75 L62 55 L78 25 L65 38 L50 32 L35 38 Z" fill="#18181b" />
          <polygon points="40,58 48,58 44,65" fill="#ffffff" />
          <polygon points="60,58 52,58 56,65" fill="#ffffff" />
        </svg>
      );

    case 'thor':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
          {/* Mjolnir Hammer */}
          <rect x="30" y="32" width="40" height="24" rx="4" fill="#94a3b8" stroke="#f1f5f9" strokeWidth="2" />
          <rect x="46" y="56" width="8" height="26" rx="2" fill="#78350f" stroke="#d97706" strokeWidth="2" />
          <circle cx="50" cy="85" r="4" fill="#78350f" />
        </svg>
      );

    case 'punisher':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="#ffffff">
          <path d="M25 25 C25 15 75 15 75 25 C75 45 78 58 70 65 L66 65 L66 85 L58 85 L58 66 L54 66 L54 85 L46 85 L46 66 L42 66 L42 85 L34 85 L34 65 L30 65 C22 58 25 45 25 25 Z" />
          <circle cx="38" cy="40" r="6" fill="#09090b" />
          <circle cx="62" cy="40" r="6" fill="#09090b" />
          <polygon points="50,48 45,55 55,55" fill="#09090b" />
        </svg>
      );

    case 'fantastic-four':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
          <path
            d="M58 22 L36 54 L58 54 L58 78 L68 78 L68 54 L75 54 L75 45 L68 45 L68 22 Z M58 45 L47 45 L58 29 Z"
            fill="#ffffff"
          />
        </svg>
      );

    case 'dr-doom':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M20 40 C20 15 80 15 80 40 C80 70 70 85 50 92 C30 85 20 70 20 40 Z" fill="#047857" />
          <path d="M32 38 C32 28 68 28 68 38 C68 62 60 76 50 82 C40 76 32 62 32 38 Z" fill="#94a3b8" />
          <rect x="38" y="45" width="10" height="6" rx="2" fill="#0f172a" />
          <rect x="52" y="45" width="10" height="6" rx="2" fill="#0f172a" />
          <rect x="42" y="62" width="16" height="4" rx="1" fill="#0f172a" />
        </svg>
      );

    case 'daredevil':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#991b1b" />
          <text
            x="32"
            y="65"
            fontSize="46"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#ffffff"
            letterSpacing="-8"
          >
            DD
          </text>
        </svg>
      );

    case 'hulk':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#15803d" />
          {/* Fist symbol */}
          <path
            d="M30 45 C30 35 45 35 45 45 L45 50 L55 50 L55 45 C55 35 70 35 70 45 C70 65 65 75 50 78 C35 75 30 65 30 45 Z"
            fill="#ffffff"
          />
        </svg>
      );

    case 'loki':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="#eab308">
          <circle cx="50" cy="50" r="46" fill="#14532d" />
          {/* Curved Golden Horns */}
          <path d="M35 48 C25 25 15 15 28 10 C38 25 42 38 42 50 Z" />
          <path d="M65 48 C75 25 85 15 72 10 C62 25 58 38 58 50 Z" />
          <polygon points="50,42 62,56 50,78 38,56" />
        </svg>
      );

    case 'scarlet-witch':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#4c0519" />
          {/* Chaos crown / tiara */}
          <path
            d="M25 45 L38 25 L45 38 L50 20 L55 38 L62 25 L75 45 L70 68 L50 78 L30 68 Z"
            fill="#f43f5e"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>
      );

    case 'x-men':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#eab308" strokeWidth="4" />
          <polygon points="34,26 66,74 54,74 22,26" fill="#eab308" />
          <polygon points="66,26 34,74 46,74 78,26" fill="#eab308" />
        </svg>
      );

    case 'moon-knight':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#09090b" stroke="#e2e8f0" strokeWidth="2" />
          <path
            d="M55 20 C35 20 22 35 22 50 C22 65 35 80 55 80 C40 72 34 60 34 50 C34 40 40 28 55 20 Z"
            fill="#f8fafc"
          />
        </svg>
      );

    case 'black-widow':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#09090b" stroke="#ef4444" strokeWidth="2" />
          <polygon points="32,25 68,25 54,50" fill="#ef4444" />
          <polygon points="54,50 68,75 32,75" fill="#ef4444" />
        </svg>
      );

    case 'blade':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#09090b" stroke="#dc2626" strokeWidth="2" />
          <path d="M48 18 L52 18 L52 68 L60 74 L50 82 L40 74 L48 68 Z" fill="#e2e8f0" />
          <rect x="36" y="66" width="28" height="5" rx="2" fill="#dc2626" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="46" fill="#ec4899" />
          <text x="50" y="58" fontSize="30" fontWeight="bold" textAnchor="middle" fill="#ffffff">
            ★
          </text>
        </svg>
      );
  }
};
