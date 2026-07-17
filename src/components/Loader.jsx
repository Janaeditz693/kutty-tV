import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tv } from 'lucide-react';

const Loader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="relative flex items-center justify-center w-20 h-20 bg-theme-coffee dark:bg-theme-orange text-theme-cream dark:text-theme-darkBg rounded-premium shadow-2xl animate-bounce">
        {/* Antennas */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-4 w-full justify-between px-2">
          <div className="w-1.5 h-4 bg-theme-coffee dark:bg-theme-orange rounded-full origin-bottom rotate-[-25deg] animate-pulse"></div>
          <div className="w-1.5 h-4 bg-theme-coffee dark:bg-theme-orange rounded-full origin-bottom rotate-[25deg] animate-pulse"></div>
        </div>
        
        {/* Spinning loader inside TV */}
        <div className="animate-spin text-theme-cream dark:text-theme-darkBg">
          <Tv size={36} className="stroke-[2.5]" />
        </div>

        {/* Pulsing TV power dot */}
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
      </div>
      
      {/* Loading Text */}
      <h3 className="mt-8 text-lg font-bold text-theme-coffee dark:text-theme-darkText tracking-wide flex items-center gap-2">
        <span className="inline-block animate-pulse">{t('common.loading')}</span>
      </h3>
      <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-1 font-medium italic">
        "Warm up the tubes, the show is starting!"
      </p>
    </div>
  );
};

export default Loader;
