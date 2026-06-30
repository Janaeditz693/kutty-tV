import React from 'react';
import { Tv } from 'lucide-react';

const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 16, text: 'text-lg', container: 'gap-1' },
    md: { icon: 22, text: 'text-2xl', container: 'gap-2' },
    lg: { icon: 32, text: 'text-4xl', container: 'gap-3' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${currentSize.container} select-none group cursor-pointer`}>
      {/* Retro TV Icon Casing */}
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-theme-coffee dark:bg-theme-orange text-theme-cream dark:text-theme-darkBg shadow-md transform transition-all duration-300 group-hover:scale-115 group-hover:rotate-3">
        {/* Antennas */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2 w-full justify-between px-1 pointer-events-none transition-transform duration-300 group-hover:-translate-y-1">
          <div className="w-1.5 h-3 bg-theme-coffee dark:bg-theme-orange rounded-full origin-bottom rotate-[-30deg]"></div>
          <div className="w-1.5 h-3 bg-theme-coffee dark:bg-theme-orange rounded-full origin-bottom rotate-[30deg]"></div>
        </div>
        
        {/* Tiny power LED dot */}
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
        
        <Tv size={currentSize.icon} className="stroke-[2.5]" />
      </div>
      
      {/* Brand Text */}
      <span className={`font-extrabold ${currentSize.text} tracking-tight font-sans transition-colors duration-300`}>
        <span className="text-theme-coffee dark:text-theme-darkText">Kutty</span>
        <span className="text-theme-orange ml-0.5">TV</span>
      </span>
    </div>
  );
};

export default Logo;
