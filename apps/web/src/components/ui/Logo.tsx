import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
  subtextColor = 'text-brand-600',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizeMap = {
    sm: { main: 'text-base', sub: 'text-[8px]' },
    md: { main: 'text-xl', sub: 'text-[10px]' },
    lg: { main: 'text-2xl', sub: 'text-[11px]' },
    xl: { main: 'text-3xl', sub: 'text-[12px]' },
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="HMS Logo"
        className={`${sizeMap[size]} shrink-0 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black ${textSizeMap[size].main} ${textColor} leading-none tracking-tight`}>
            HMS
          </span>
          <span className={`tracking-wider uppercase font-extrabold ${subtextColor} ${textSizeMap[size].sub} mt-0.5`}>
            HOSTEL & STAY
          </span>
        </div>
      )}
    </div>
  );
};
