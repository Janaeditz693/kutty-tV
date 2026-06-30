import React from 'react';

const Skeleton = ({ variant = 'card', className = '' }) => {
  const baseClasses = 'bg-theme-coffee/10 dark:bg-theme-darkCard/60 animate-pulse rounded-premium';
  
  if (variant === 'hero') {
    return (
      <div className={`w-full aspect-[16/9] md:aspect-[21/9] ${baseClasses} ${className}`} />
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`rounded-full ${baseClasses} ${className}`} />
    );
  }

  if (variant === 'text') {
    return (
      <div className={`h-4 w-full rounded ${baseClasses} ${className}`} />
    );
  }

  // Default 'card' style (widescreen cartoon thumbnail)
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Thumbnail Aspect Ratio 16:10 */}
      <div className={`w-full aspect-[16/10] ${baseClasses}`} />
      
      {/* Title Line */}
      <div className="flex flex-col gap-2 px-1">
        <div className={`h-4 w-3/4 rounded ${baseClasses}`} />
        <div className={`h-3 w-1/2 rounded ${baseClasses}`} />
      </div>
    </div>
  );
};

export default Skeleton;
