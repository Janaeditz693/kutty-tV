import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

const Auth = () => {
  const { t } = useTranslation();
  const { login, signup, loginGoogle, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password || (!isLogin && !displayName)) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate(redirect);
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    setLoading(true);
    try {
      await loginGoogle();
      navigate(redirect);
    } catch (err) {
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill and log in quickly for demo/testing
  const handleQuickFill = async (role) => {
    setLocalError('');
    setLoading(true);
    const credentials = {
      viewer: { email: 'viewer@kuttytv.com', pass: 'viewer123' }
    };
    const target = credentials[role];
    if (!target) return;
    try {
      setEmail(target.email);
      setPassword(target.pass);
      await login(target.email, target.pass);
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex justify-center items-center min-h-[80vh]">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-premium bg-theme-cream border-2 border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex flex-col gap-6"
      >
        {/* Connection Mode Indicator */}
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-theme-coffee/5 dark:bg-theme-darkBg text-theme-coffee/60 dark:text-theme-darkText/60">
          <span>Connection Status:</span>
          {isFirebaseConfigured ? (
            <span className="text-green-600 dark:text-green-500 animate-pulse">Firebase Connected</span>
          ) : (
            <span className="text-theme-orange">Local Mock Mode</span>
          )}
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-theme-coffee/10 dark:border-theme-darkBorder">
          <button
            onClick={() => { setIsLogin(true); setLocalError(''); }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
              isLogin 
                ? 'border-b-2 border-theme-orange text-theme-orange' 
                : 'text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
            }`}
          >
            {t('common.login')}
          </button>
          <button
            onClick={() => { setIsLogin(false); setLocalError(''); }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
              !isLogin 
                ? 'border-b-2 border-theme-orange text-theme-orange' 
                : 'text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
            }`}
          >
            Join Club (Register)
          </button>
        </div>

        {/* Brand slogan */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText">
            {isLogin ? 'Welcome Back!' : 'Create Kids Club Account'}
          </h2>
          <p className="text-xs text-theme-coffee/60 dark:text-theme-darkText/50 mt-1">
            {t('common.tagline')}
          </p>
        </div>

        {/* Error Notifications */}
        {(localError || authError) && (
          <div className="p-3.5 rounded-xl bg-red-550/15 border border-red-550/30 text-red-600 dark:text-red-500 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Display Name (Only in Registration) */}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/70 dark:text-theme-darkText/60">{t('admin.title')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bobby Retro"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-theme-orange/40"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-coffee/40 dark:text-theme-darkText/40" />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/70 dark:text-theme-darkText/60">{t('profile.email')}</label>
            <div className="relative">
              <input
                type="email"
                placeholder="kid@kuttytv.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-theme-orange/40"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-coffee/40 dark:text-theme-darkText/40" />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/70 dark:text-theme-darkText/60">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-theme-orange/40"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-coffee/40 dark:text-theme-darkText/40" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-theme-orange hover:bg-theme-orange-light text-theme-cream font-bold rounded-xl shadow-md transition-all duration-250 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-theme-cream border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{isLogin ? t('common.login') : 'Register'}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 my-1">
          <div className="h-[1px] flex-grow bg-theme-coffee/10 dark:bg-theme-darkBorder" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-coffee/40 dark:text-theme-darkText/30">Or Continue With</span>
          <div className="h-[1px] flex-grow bg-theme-coffee/10 dark:bg-theme-darkBorder" />
        </div>

        {/* Google Login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-theme-cream border border-theme-coffee/20 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText font-bold rounded-xl shadow-sm hover:bg-theme-coffee/5 dark:hover:bg-theme-darkCard transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {/* Flat Google logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Login</span>
        </button>

        {/* Quick Demo Fills */}
        {isLogin && (
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-theme-orange/5 border border-theme-orange/10 mt-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-orange flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
              Quick-Fill Test Account:
            </span>
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => handleQuickFill('viewer')}
                disabled={loading}
                className="w-full py-2 px-3 bg-theme-coffee/10 hover:bg-theme-coffee/15 dark:bg-theme-darkCard dark:hover:bg-theme-darkBorder text-theme-coffee dark:text-theme-darkText font-bold text-[11px] rounded-lg transition-colors duration-150 cursor-pointer"
              >
                Kid Viewer
              </button>
            </div>
            <span className="text-[9px] text-theme-coffee/40 dark:text-theme-darkText/30 italic text-center mt-1">
              Provides instant bypass for local testing. Admin credentials must be typed manually for safety.
            </span>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Auth;
