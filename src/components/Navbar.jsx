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
  X,
  Coffee,
  Copy,
  Check
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
  const [copiedUpi, setCopiedUpi] = useState(false);

  const profileMenuRef = useRef(null);

  // Transparent over the home hero, solid once scrolled
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onHero = location.pathname === '/' && !scrolled;

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

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText('janaeditz693@okicici');
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const menuItems = [
    { name: t('common.home'), path: '/', icon: Home },
    { name: t('common.shows'), path: '/shows', icon: Tv },
    { name: t('common.movies'), path: '/movies', icon: Film },
  ];

  const openCoffee = () => {
    setMobileMenuOpen(false);
    setIsCoffeeModalOpen(true);
    setShowCoffeeQr(false);
    setCoffeeAmount(10);
    setCustomAmountError('');
  };

  // Icon-button look that adapts to being over the dark hero
  const iconBtn = onHero
    ? 'text-white hover:bg-white/15'
    : 'text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/10 dark:hover:bg-white/10';

  const tabItems = [
    { name: t('common.home'), path: '/', icon: Home },
    { name: t('common.shows'), path: '/shows', icon: Tv },
    { name: t('common.movies'), path: '/movies', icon: Film },
    { name: t('common.favorites'), path: '/favorites', icon: Heart },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${onHero ? 'glass-nav-transparent' : 'glass-nav'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: logo + desktop links */}
            <div className="flex items-center gap-6 lg:gap-8 min-w-0">
              <div className="flex-shrink-0" onClick={() => navigate('/')}>
                <Logo size="md" light={onHero} />
              </div>

              <div className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-theme-orange text-white shadow-md shadow-orange-500/25'
                          : onHero
                            ? 'text-white/80 hover:text-white hover:bg-white/15'
                            : 'text-theme-coffee/70 dark:text-theme-darkText/70 hover:text-theme-coffee dark:hover:text-white hover:bg-theme-coffee/8 dark:hover:bg-white/10'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right: utilities */}
            <div className="flex items-center gap-0.5 sm:gap-2">

              {/* Desktop search */}
              <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-64 pl-4 pr-10 py-2 rounded-full text-sm bg-white/10 dark:bg-white/10 text-theme-coffee dark:text-white placeholder-theme-coffee/50 dark:placeholder-white/50 border border-theme-coffee/15 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-theme-orange/60 focus:w-64 xl:focus:w-72 transition-all duration-300"
                  style={onHero ? { color: '#fff', borderColor: 'rgba(255,255,255,0.25)' } : undefined}
                />
                <button type="submit" aria-label="Search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-coffee/60 dark:text-white/60 hover:text-theme-orange cursor-pointer">
                  <Search size={16} />
                </button>
              </form>

              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label="Search"
                className={`lg:hidden p-2.5 rounded-full transition-colors cursor-pointer ${iconBtn}`}
              >
                {mobileSearchOpen ? <X size={19} /> : <Search size={19} />}
              </button>

              {/* Language */}
              <button
                onClick={toggleLanguage}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold border transition-colors cursor-pointer ${
                  onHero
                    ? 'border-white/30 text-white hover:bg-white/15'
                    : 'border-theme-coffee/20 dark:border-white/20 text-theme-coffee dark:text-white hover:bg-theme-coffee/10 dark:hover:bg-white/10'
                }`}
                title="Change Language / மொழி மாற்றம்"
              >
                {currentLang.startsWith('ta') ? 'EN' : 'தமிழ்'}
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${iconBtn}`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Favorites (desktop) */}
              <Link
                to="/favorites"
                aria-label={t('common.favorites')}
                className={`relative hidden lg:flex p-2.5 rounded-full transition-colors ${iconBtn}`}
              >
                <Heart size={18} className={favorites.length > 0 ? 'fill-theme-orange stroke-theme-orange' : ''} />
                {favorites.length > 0 && (
                  <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-extrabold text-white bg-theme-orange rounded-full">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Coffee: icon on mobile, labelled on desktop */}
              <button
                onClick={openCoffee}
                aria-label="Buy me a Coffee"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme-sun hover:brightness-95 text-black font-extrabold text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Coffee size={16} />
                <span>Buy me a Coffee</span>
              </button>

              {/* Sign In / Profile dropdown */}
              {currentUser ? (
                <div className="relative flex items-center" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsOpenProfile(!isOpenProfile)}
                    aria-label="Account menu"
                    className="flex items-center gap-1 p-0.5 rounded-full focus:outline-none cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-theme-orange to-theme-sun text-white font-extrabold flex items-center justify-center shadow ring-2 ring-white/20">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <ChevronDown size={14} className={`hidden sm:inline ${onHero ? 'text-white/70' : 'text-theme-coffee/50 dark:text-white/50'}`} />
                  </button>

                  <AnimatePresence>
                    {isOpenProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2.5 w-60 rounded-2xl bg-white dark:bg-theme-darkCard border border-theme-coffee/10 dark:border-theme-darkBorder shadow-2xl overflow-hidden py-1.5 z-50"
                      >
                        <div className="px-4 py-3 border-b border-theme-coffee/10 dark:border-theme-darkBorder">
                          <p className="text-sm font-extrabold text-theme-coffee dark:text-theme-darkText truncate">{currentUser.displayName || 'Viewer'}</p>
                          <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/50 truncate">{currentUser.email}</p>
                        </div>

                        {[
                          { to: '/profile', icon: User, label: t('common.profile') },
                          { to: '/profile?tab=settings', icon: Settings, label: t('common.settings') },
                          { to: '/profile?tab=history', icon: History, label: t('profile.watchHistory') },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setIsOpenProfile(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-theme-coffee/80 dark:text-theme-darkText/80 hover:bg-theme-coffee/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <Icon size={16} />
                            {label}
                          </Link>
                        ))}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpenProfile(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-theme-orange hover:bg-theme-coffee/5 dark:hover:bg-white/5 border-t border-theme-coffee/10 dark:border-theme-darkBorder transition-colors"
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
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 border-t border-theme-coffee/10 dark:border-theme-darkBorder transition-colors cursor-pointer"
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
                  aria-label={t('common.login')}
                  className="p-2.5 min-[420px]:px-4 min-[420px]:py-2 rounded-full bg-theme-orange hover:bg-theme-orange-light text-white font-extrabold text-sm transition-all active:scale-95 shadow-md shadow-orange-500/25 flex items-center gap-1.5 shrink-0"
                >
                  <User size={16} />
                  <span className="hidden min-[420px]:inline">{t('common.login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search row */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileSearchOpen(false);
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden px-4 pb-3 bg-theme-darkBg/90 backdrop-blur-xl"
            >
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      navigate(`/search?q=${encodeURIComponent(val.trim())}`, { replace: true });
                    }
                  }}
                  className="w-full pl-4 pr-10 py-2.5 rounded-full text-sm bg-white/10 text-white placeholder-white/50 border border-white/15 focus:outline-none focus:ring-2 focus:ring-theme-orange/60"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/92 dark:bg-theme-darkBg/92 backdrop-blur-xl border-t border-theme-coffee/10 dark:border-theme-darkBorder pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {tabItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors ${
                  isActive ? 'text-theme-orange' : 'text-theme-coffee/55 dark:text-theme-darkText/55'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-theme-orange" />}
                  <item.icon size={20} className={isActive ? 'fill-theme-orange/20' : ''} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={openCoffee}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-theme-coffee/55 dark:text-theme-darkText/55 cursor-pointer"
          >
            <Coffee size={20} />
            <span>Support</span>
          </button>
        </div>
      </div>

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
                        src="/gpay-qr.png"
                        alt="UPI Payment QR Code"
                        className="w-44 h-44 object-contain rounded-xl"
                      />
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-zinc-500">Scan with GPay, PhonePe, or Paytm</p>
                        <p className="text-base font-extrabold text-[#FF5A1F] mt-0.5">₹{coffeeAmount}</p>
                      </div>
                    </div>

                    {/* Pay via UPI App for Mobile */}
                    <div className="w-full flex flex-col gap-1.5">
                      <a
                        href="upi://pay?pa=janaeditz693@okicici&pn=JANA%20V"
                        className="w-full py-2.5 bg-[#FF5A1F] hover:bg-[#FF7A47] text-white text-center font-bold text-sm rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Coffee size={15} className="fill-white stroke-none" />
                        <span>Pay via UPI App (Mobile)</span>
                      </a>
                      <p className="text-[9px] text-center font-bold text-red-500/80 dark:text-red-400/80">
                        * Note: If your bank blocks browser direct links, use the Copy method below.
                      </p>
                    </div>

                    {/* Premium Instructions & Copy Block */}
                    <div className="w-full mt-1.5 flex flex-col gap-1.5 text-left border-t border-theme-coffee/10 dark:border-theme-darkBorder pt-3">
                      <span className="text-[10px] font-extrabold text-theme-coffee/50 dark:text-theme-darkText/50 uppercase tracking-wider">
                        Easy Manual Payment Steps:
                      </span>
                      <p className="text-[10px] text-theme-coffee/80 dark:text-theme-darkText/75 leading-relaxed font-semibold">
                        1. Tap **Copy** below to copy the UPI ID.<br />
                        2. Open **Google Pay**, **PhonePe**, or **Paytm**.<br />
                        3. Select **Pay to UPI ID**, paste it, and make payment.
                      </p>
                      
                      <div className="flex items-center justify-between w-full p-2.5 rounded-xl border border-[#FF5A1F]/30 bg-theme-coffee/5 dark:bg-theme-darkCard text-xs shadow-inner mt-0.5">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-[#FF5A1F] uppercase">UPI ID</span>
                          <span className="font-mono font-bold text-theme-coffee dark:text-theme-darkText select-all text-sm">janaeditz693@okicici</span>
                        </div>
                        <button
                          onClick={handleCopyUpi}
                          className="px-3 py-1.5 rounded-lg bg-[#FF5A1F]/10 hover:bg-[#FF5A1F]/20 transition-colors text-[#FF5A1F] cursor-pointer flex items-center justify-center border border-[#FF5A1F]/20 font-extrabold gap-1 active:scale-95 text-[10px]"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <>
                              <Check size={12} className="text-green-600 dark:text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

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
