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
  ChevronDown,
  Home,
  Tv,
  Film,
  Menu,
  X,
  Coffee
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

  // Navigation states
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Coffee Modal states
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState(10);
  const [showCoffeeQr, setShowCoffeeQr] = useState(false);
  const [customAmountError, setCustomAmountError] = useState('');

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
      setMobileMenuOpen(false);
    }
  };

  // Coffee amount change handler
  const handleAmountChange = (val) => {
    if (val === '') {
      setCoffeeAmount('');
      setCustomAmountError('Please enter an amount');
      return;
    }
    const amt = parseInt(val, 10);
    if (isNaN(amt)) {
      setCoffeeAmount('');
      setCustomAmountError('Please enter a valid number');
      return;
    }
    if (amt < 1 || amt > 100) {
      setCoffeeAmount(amt);
      setCustomAmountError('Amount must be between ₹1 and ₹100');
    } else {
      setCoffeeAmount(amt);
      setCustomAmountError('');
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
            
            {/* Left side: Logo & Navigation links */}
            <div className="flex items-center gap-6 lg:gap-10">
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
            </div>

            {/* Right side: Utilities (Search, Language, Theme, Profile, Buy me a Coffee) */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Search Bar (Desktop - Magnifying Glass icon on the right to match layout) */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 lg:w-60 px-4 py-2 pr-10 rounded-xl text-sm bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 focus:border-[#FF5A1F] transition-all duration-300"
                />
                <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer">
                  <Search size={16} />
                </button>
              </form>

              {/* Mobile Search Bar (Directly in header next to Hamburger) */}
              <form onSubmit={handleSearchSubmit} className="relative md:hidden flex-grow max-w-[150px] xs:max-w-[200px]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 pr-8 rounded-lg text-xs bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700/40 focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Search size={12} />
                </button>
              </form>

              {/* Language Switcher (Desktop Only) */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-bold bg-theme-coffee/5 border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/10 dark:hover:bg-theme-darkBorder transition-all duration-200 cursor-pointer"
                title="Change Language / மொழி மாற்றம்"
              >
                {currentLang.startsWith('ta') ? 'EN' : 'தமிழ்'}
              </button>

              {/* Theme Toggle (Desktop Only) */}
              <button
                onClick={toggleTheme}
                className="hidden sm:inline-block p-2 rounded-xl bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Favorites (Desktop Only) */}
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

              {/* Sign In / Profile dropdown */}
              {currentUser ? (
                <div className="relative hidden sm:block" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsOpenProfile(!isOpenProfile)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-theme-coffee/5 dark:hover:bg-theme-darkCard transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-theme-orange text-theme-cream font-bold flex items-center justify-center shadow-inner">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <ChevronDown size={14} className="text-theme-coffee/50 dark:text-theme-darkText/50 hidden sm:inline" />
                  </button>

                  <AnimatePresence>
                    {isOpenProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-56 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-2xl overflow-hidden py-1.5 z-50"
                      >
                        <div className="px-4 py-2 border-b border-theme-coffee/10 dark:border-theme-darkBorder">
                          <p className="text-xs text-theme-coffee/60 dark:text-theme-darkText/50">{t('common.appName')}</p>
                          <p className="text-sm font-bold text-theme-coffee dark:text-theme-darkText truncate">{currentUser.displayName || 'Viewer'}</p>
                          <p className="text-xs text-theme-coffee/40 dark:text-theme-darkText/30 truncate">{currentUser.email}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <User size={16} />
                          {t('common.profile')}
                        </Link>

                        <Link
                          to="/profile?tab=settings"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <Settings size={16} />
                          {t('common.settings')}
                        </Link>

                        <Link
                          to="/profile?tab=history"
                          onClick={() => setIsOpenProfile(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-colors duration-150"
                        >
                          <History size={16} />
                          {t('profile.watchHistory')}
                        </Link>

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
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder border-t border-theme-coffee/10 dark:border-theme-darkBorder transition-colors duration-150 cursor-pointer"
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
                  className="text-sm font-semibold text-theme-coffee/80 dark:text-theme-darkText/80 hover:text-[#FF5A1F] transition-colors duration-200 hidden sm:block"
                >
                  Sign In
                </Link>
              )}

              {/* Premium Buy Me a Coffee Button (Replacing Subscribe button) */}
              <button
                onClick={() => {
                  setIsCoffeeModalOpen(true);
                  setShowCoffeeQr(false);
                  setCoffeeAmount(10);
                  setCustomAmountError('');
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FF5A1F] hover:bg-[#FF7A47] text-white font-extrabold text-sm rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Coffee size={15} className="fill-white stroke-none" />
                <span>Buy me a Coffee</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/5 dark:hover:bg-theme-darkCard transition-all duration-200 cursor-pointer"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-theme-coffee/10 dark:border-theme-darkBorder bg-theme-cream dark:bg-theme-darkBg transition-colors duration-300 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold text-theme-coffee/80 dark:text-theme-darkText/80 hover:text-theme-orange transition-colors duration-150"
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Favorites Link */}
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-semibold text-theme-coffee/80 dark:text-theme-darkText/80 hover:text-theme-orange transition-colors duration-150"
                >
                  <Heart size={16} />
                  <span>{t('common.favorites')} ({favorites.length})</span>
                </Link>

                <hr className="border-theme-coffee/10 dark:border-theme-darkBorder" />

                {/* Mobile Quick Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Language switch */}
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-theme-coffee/5 dark:bg-theme-darkCard border border-theme-coffee/15 dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText cursor-pointer"
                  >
                    {currentLang.startsWith('ta') ? 'EN' : 'தமிழ்'}
                  </button>

                  {/* Dark Mode toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText cursor-pointer"
                  >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                  </button>

                  {/* User Profile & Logout on Mobile */}
                  {currentUser && (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-theme-coffee/5 dark:bg-theme-darkCard text-theme-coffee dark:text-theme-darkText"
                      >
                        <User size={13} />
                        <span>{currentUser.displayName || 'Profile'}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Buy me a Coffee (Mobile full width) */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCoffeeModalOpen(true);
                    setShowCoffeeQr(false);
                    setCoffeeAmount(10);
                    setCustomAmountError('');
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF5A1F] hover:bg-[#FF7A47] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer"
                >
                  <Coffee size={16} className="fill-white stroke-none" />
                  <span>Buy me a Coffee</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Buy Me a Coffee UPI QR Code Modal */}
      <AnimatePresence>
        {isCoffeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-2xl overflow-hidden text-theme-coffee dark:text-theme-darkText"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCoffeeModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-theme-coffee/50 dark:text-theme-darkText/50 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder transition-all duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center gap-4">
                {/* Coffee Header Icon */}
                <div className="w-14 h-14 rounded-full bg-[#FF5A1F]/10 flex items-center justify-center text-[#FF5A1F]">
                  <Coffee size={28} className="fill-[#FF5A1F]" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Buy Me a Coffee ☕</h3>
                  <p className="text-xs sm:text-sm mt-1 text-theme-coffee/70 dark:text-theme-darkText/70">
                    If you love Kutty TV, support us! Choose or input an amount between ₹1 and ₹100.
                  </p>
                </div>

                {!showCoffeeQr ? (
                  <>
                    {/* Preset Amount buttons */}
                    <div className="grid grid-cols-4 gap-2 w-full mt-2">
                      {[10, 20, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setCoffeeAmount(preset);
                            setCustomAmountError('');
                          }}
                          className={`py-2 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer ${
                            coffeeAmount === preset
                              ? 'bg-[#FF5A1F] text-white border-transparent shadow-md scale-105'
                              : 'bg-theme-coffee/5 border-theme-coffee/10 dark:bg-theme-darkBorder/50 dark:border-theme-darkBorder hover:bg-theme-coffee/10'
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>

                    {/* Custom input */}
                    <div className="w-full flex flex-col gap-1.5 items-start mt-2">
                      <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-theme-coffee/50 dark:text-theme-darkText/50">Custom Amount (₹)</label>
                      <div className="relative w-full">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Enter amount (1-100)"
                          value={coffeeAmount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkBorder/50 dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40 focus:border-[#FF5A1F] transition-all duration-200"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF5A1F]">INR</span>
                      </div>
                      {customAmountError && (
                        <p className="text-xs text-red-500 font-medium">{customAmountError}</p>
                      )}
                    </div>

                    {/* Generate Button */}
                    <button
                      disabled={!!customAmountError || !coffeeAmount}
                      onClick={() => setShowCoffeeQr(true)}
                      className="w-full mt-4 py-3 bg-[#FF5A1F] hover:bg-[#FF7A47] disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Generate UPI QR Code
                    </button>
                  </>
                ) : (
                  <>
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-theme-coffee/10 shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=janaeditz693@okicici&pn=Jana%20v&am=${coffeeAmount}&cu=INR&tn=Coffee%20Support`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="w-44 h-44 object-contain"
                      />
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-zinc-500">Scan with GPay, PhonePe, or Paytm</p>
                        <p className="text-base font-extrabold text-[#FF5A1F] mt-0.5">₹{coffeeAmount}</p>
                      </div>
                    </div>

                    {/* Pay via UPI App for Mobile */}
                    <a
                      href={`upi://pay?pa=janaeditz693@okicici&pn=Jana%20v&am=${coffeeAmount}&cu=INR&tn=Coffee%20Support`}
                      className="w-full py-2.5 bg-[#FF5A1F] hover:bg-[#FF7A47] text-white text-center font-bold text-sm rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Coffee size={15} className="fill-white stroke-none" />
                      <span>Pay via UPI App (Mobile)</span>
                    </a>

                    <p className="text-xs text-theme-coffee/60 dark:text-theme-darkText/50">
                      UPI ID: <span className="font-mono font-bold select-all bg-theme-coffee/5 px-2 py-0.5 rounded border border-theme-coffee/10 dark:bg-theme-darkBorder">janaeditz693@okicici</span>
                    </p>

                    {/* Back button */}
                    <div className="flex gap-2 w-full mt-4">
                      <button
                        onClick={() => setShowCoffeeQr(false)}
                        className="flex-1 py-2.5 border border-theme-coffee/15 dark:border-theme-darkBorder text-sm font-bold rounded-xl hover:bg-theme-coffee/5 transition-all duration-150 cursor-pointer"
                      >
                        Change Amount
                      </button>
                      <button
                        onClick={() => setIsCoffeeModalOpen(false)}
                        className="flex-1 py-2.5 bg-[#FF5A1F] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all duration-150 cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
