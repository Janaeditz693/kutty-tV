import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-theme-beige/30 border-t border-theme-coffee/10 dark:bg-theme-darkCard/40 dark:border-theme-darkBorder transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-12 pb-24 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium mt-1">
              {t('common.tagline')}
            </p>
          </div>
          
          {/* Quick links & nostalgic reminder */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-3">
            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-theme-coffee/70 dark:text-theme-darkText/60">
              <a href="#about" className="hover:text-theme-orange transition-colors duration-200">About</a>
              <a href="#privacy" className="hover:text-theme-orange transition-colors duration-200">Privacy Policy</a>
              <a href="#terms" className="hover:text-theme-orange transition-colors duration-200">Terms of Service</a>
              <a href="#contact" className="hover:text-theme-orange transition-colors duration-200">Contact</a>
            </div>
            
            <p className="text-[10px] text-theme-coffee/40 dark:text-theme-darkText/40 flex items-center gap-1.5 justify-center md:justify-end">
              Made with <Heart size={10} className="fill-theme-orange stroke-theme-orange animate-pulse" /> for 90s & 2000s kids.
            </p>
          </div>

        </div>

        {/* Nostalgic vintage divider */}
        <hr className="my-6 border-theme-coffee/10 dark:border-theme-darkBorder" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-theme-coffee/50 dark:text-theme-darkText/50 text-center">
          <p>© {new Date().getFullYear()} {t('common.appName')}. All nostalgic rights reserved.</p>
          <div className="flex items-center gap-1 text-theme-orange">
            <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span>Turn on the CRT static on the Watch page for the true retro experience!</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
