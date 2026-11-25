import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from './Skeleton';

const Carousel = ({ title, loading = false, wide = false, seeAllTo, id, children }) => {
  const { t } = useTranslation();
  const itemWidth = wide ? 'w-60 sm:w-72' : 'w-36 sm:w-44 lg:w-52';
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
    <div id={id} className="relative w-full max-w-7xl mx-auto py-3 group/carousel scroll-mt-20">
      {/* Row Header Title */}
      <div className="px-4 sm:px-6 lg:px-8 mb-2 flex items-baseline justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-theme-coffee dark:text-theme-darkText tracking-tight">
          {title}
        </h2>
        {seeAllTo && (
          <Link to={seeAllTo} className="text-xs sm:text-sm font-semibold text-theme-coffee/50 dark:text-theme-darkText/55 hover:text-theme-accent-text transition-colors">
            {t('common.seeAll', { defaultValue: 'See all' })}
          </Link>
        )}
      </div>

      {/* Outer Shell */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        
        {/* Left Arrow Button */}
        {showLeftArrow && !loading && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-6 top-[38%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-theme-accent text-theme-onaccent hover:scale-110 active:scale-95 shadow-lg border border-theme-coffee/10 dark:border-theme-darkBorder transition-all duration-200 cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>
        )}

        {/* Horizontal Scroll Area */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pt-2 pb-5 px-1"
        >
          {loading ? (
            // Pulser Skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant={wide ? 'card' : 'poster'} className={`${itemWidth} flex-shrink-0`} />
            ))
          ) : (
            React.Children.map(children, (child, idx) => (
              <div key={idx} className={`${itemWidth} flex-shrink-0 flex`}>
                {child}
              </div>
            ))
          )}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && !loading && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-6 top-[38%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-theme-accent text-theme-onaccent hover:scale-110 active:scale-95 shadow-lg border border-theme-coffee/10 dark:border-theme-darkBorder transition-all duration-200 cursor-pointer hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        )}

      </div>
    </div>
  );
};

export default Carousel;
