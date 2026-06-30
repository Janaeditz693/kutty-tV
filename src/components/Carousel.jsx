import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from './Skeleton';

const Carousel = ({ title, loading = false, children }) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll position to hide/show arrows
  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children, loading]);

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of view width
      const targetScroll = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full py-4 group/carousel">
      {/* Row Header Title */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-theme-coffee dark:text-theme-darkText px-4 sm:px-8 mb-4 tracking-wide">
        {title}
      </h2>

      {/* Outer Shell */}
      <div className="relative w-full px-4 sm:px-8">
        
        {/* Left Arrow Button */}
        {showLeftArrow && !loading && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-6 top-[40%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-theme-coffee/85 text-theme-cream dark:bg-theme-darkCard/80 dark:text-theme-darkText hover:scale-110 active:scale-95 shadow-lg border border-theme-coffee/10 dark:border-theme-darkBorder transition-all duration-200 cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>
        )}

        {/* Horizontal Scroll Area */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {loading ? (
            // Pulser Skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" className="w-56 sm:w-64 flex-shrink-0" />
            ))
          ) : (
            children
          )}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && !loading && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-6 top-[40%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-theme-coffee/85 text-theme-cream dark:bg-theme-darkCard/80 dark:text-theme-darkText hover:scale-110 active:scale-95 shadow-lg border border-theme-coffee/10 dark:border-theme-darkBorder transition-all duration-200 cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        )}

      </div>
    </div>
  );
};

export default Carousel;
