import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Search, 
  Heart, 
  User, 
  LogOut, 
  Settings, 
  ShieldAlert, 
  History, 
  Sparkles, 
  ChevronDown,
  Home,
  Tv,
  Film,
  Grid
} from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const { currentUser, logout, isAdmin } = useAuth();
  const { favorites } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsOpenProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync language with state
  const currentLang = i18n.language || 'en';
  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith('ta') ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const menuItems = [
    { name: t('common.home'), path: '/', icon: Home },
    { name: t('common.shows'), path: '/shows', icon: Tv },
    { name: t('common.movies'), path: '/movies', icon: Film },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0" onClick={() => navigate('/')}>
              <Logo size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-1 lg:space-x-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                      isActive 
                        ? 'bg-theme-coffee/10 text-theme-coffee dark:bg-theme-orange/20 dark:text-theme-orange' 
                        : 'text-theme-coffee/70 dark:text-theme-darkText/70 hover:text-theme-coffee hover:bg-theme-coffee/5 dark:hover:text-theme-darkText dark:hover:bg-theme-darkCard'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Utilities (Search, Language, Theme, Favorites, User Profile) */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Expanding Search Bar (Desktop) */}
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 px-4 py-2 pl-10 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText placeholder-theme-coffee/40 dark:placeholder-theme-darkText/40 focus:outline-none focus:ring-2 focus:ring-theme-orange/40 focus:border-theme-orange transition-all duration-300"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-coffee/40 dark:text-theme-darkText/40" />
              </form>

              {/* Mobile Search Button */}
              <button 
                onClick={() => navigate('/search')}
                className="p-2 sm:hidden rounded-xl bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText hover:scale-105 transition-transform duration-200"
              >
                <Search size={18} />
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-theme-coffee/5 border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/10 dark:hover:bg-theme-darkBorder transition-all duration-200"
                title="Change Language / மொழி மாற்றம்"
              >
                {currentLang.startsWith('ta') ? 'EN' : 'தமிழ்'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText hover:scale-110 active:scale-95 transition-all duration-200"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Favorites (Desktop) */}
              <Link
                to="/favorites"
                className="relative hidden md:flex p-2 rounded-xl bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText hover:scale-110 transition-transform duration-200"
              >
                <Heart size={18} className={favorites.length > 0 ? 'fill-theme-orange stroke-theme-orange' : ''} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-extrabold text-theme-cream bg-theme-orange rounded-full shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* User Menu / Avatar */}
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsOpenProfile(!isOpenProfile)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-theme-coffee/5 dark:hover:bg-theme-darkCard transition-all duration-200 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-theme-orange text-theme-cream font-bold flex items-center justify-center shadow-inner">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <ChevronDown size={14} className={`text-theme-coffee/50 dark:text-theme-darkText/50 transition-transform duration-200 ${isOpenProfile ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isOpenProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-56 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-2xl overflow-hidden py-1.5"
                      >
                        <div className="px-4 py-2 border-b border-theme-coffee/10 dark:border-theme-darkBorder">
                          <p className="text-xs text-theme-coffee/60 dark:text-theme-darkText/50">{t('common.appName')}</p>
                          <p className="text-sm font-bold text-theme-coffee dark:text-theme-darkText truncate">{currentUser.displayName || 'Viewer'}</p>
                          <p className="text-xs text-theme-coffee/40 dark:text-theme-darkText/30 truncate">{currentUser.email}</p>
                        </div>
                        
                        {/* Profile option */}
                        <Link
                          to="/profile"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <User size={16} />
                          {t('common.profile')}
                        </Link>

                        {/* Settings */}
                        <Link
                          to="/profile?tab=settings"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <Settings size={16} />
                          {t('common.settings')}
                        </Link>

                        {/* Watch History */}
                        <Link
                          to="/profile?tab=history"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <History size={16} />
                          {t('profile.watchHistory')}
                        </Link>

                        {/* Admin Link if authorized */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpenProfile(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-theme-orange hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder font-semibold border-t border-theme-coffee/10 dark:border-theme-darkBorder transition-colors duration-150"
                          >
                            <ShieldAlert size={16} />
                            {t('common.admin')}
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsOpenProfile(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder border-t border-theme-coffee/10 dark:border-theme-darkBorder transition-colors duration-150"
                        >
                          <LogOut size={16} />
                          {t('common.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-theme-cream bg-theme-orange hover:bg-theme-orange-light rounded-xl shadow-md transition-all duration-200 active:scale-95"
                >
                  <Sparkles size={14} className="animate-pulse" />
                  {t('common.login')}
                </Link>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Tab Bar (Mobile Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-cream/80 dark:bg-theme-darkBg/80 backdrop-blur-lg border-t border-theme-coffee/10 dark:border-theme-darkBorder px-3 py-2 flex justify-around items-center shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 transition-all duration-150 ${
                isActive 
                  ? 'text-theme-orange scale-105 font-bold' 
                  : 'text-theme-coffee/60 dark:text-theme-darkText/60'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[10px] tracking-wide font-sans">{item.name}</span>
            </Link>
          );
        })}
        {/* Favorites Mobile Link */}
        <Link
          to="/favorites"
          className={`relative flex flex-col items-center gap-0.5 transition-all duration-150 ${
            location.pathname === '/favorites' 
              ? 'text-theme-orange scale-105 font-bold' 
              : 'text-theme-coffee/60 dark:text-theme-darkText/60'
          }`}
        >
          <Heart size={20} className={location.pathname === '/favorites' ? 'fill-theme-orange stroke-theme-orange stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-wide font-sans">{t('common.favorites')}</span>
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-extrabold text-theme-cream bg-theme-orange rounded-full shadow-sm">
              {favorites.length}
            </span>
          )}
        </Link>
      </div>
    </>
  );
};

export default Navbar;
