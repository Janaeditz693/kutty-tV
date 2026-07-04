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
      {/* Custom Branded Logo Image */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-theme-cream border border-theme-coffee/10 dark:border-theme-darkBorder shadow-inner transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-2">
        <img 
          src="/logo.jpg" 
          alt="Kutty TV Logo" 
          className="object-contain"
          style={{
            width: currentSize.icon * 1.8,
            height: currentSize.icon * 1.8
          }}
        />
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
