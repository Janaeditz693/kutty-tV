import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  History, 
  Settings, 
  Tv, 
  Globe, 
  Sun, 
  Moon, 
  Trash2, 
  Check, 
  Edit2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { watchHistory, clearHistory } = useApp();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Custom global CRT static toggle
  const [crtEnabled, setCrtEnabled] = useState(() => {
    return localStorage.getItem('kuttytv_global_crt') === 'true';
  });

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setMessage('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    
    setLoading(true);
    setMessage('');
    try {
      await updateProfile({ displayName: displayName.trim() });
      setEditMode(false);
      setMessage(t('profile.successUpdate'));
    } catch (err) {
      console.error(err);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleCrtFilter = () => {
    const nextVal = !crtEnabled;
    setCrtEnabled(nextVal);
    localStorage.setItem('kuttytv_global_crt', nextVal ? 'true' : 'false');
    // Dispatch custom event to update any active players instantly
    window.dispatchEvent(new Event('crtSettingsChanged'));
  };

  const currentLang = i18n.language || 'en';
  const handleLangSelect = (lng) => {
    i18n.changeLanguage(lng);
  };

  const tabs = [
    { id: 'profile', label: t('common.profile'), icon: User },
    { id: 'history', label: t('profile.watchHistory'), icon: History },
    { id: 'settings', label: t('common.settings'), icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText">
          Kids Club Profile
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
          Manage your account preferences, playback settings, and history.
        </p>
      </div>

      {/* Main card box with side tabs */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        
        {/* Left Side Tab Navigation */}
        <div className="flex md:flex-col gap-1 md:w-60 overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-theme-orange text-theme-cream shadow-md'
                    : 'text-theme-coffee/70 dark:text-theme-darkText/70 hover:bg-theme-coffee/5 dark:hover:bg-theme-darkCard'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Pane */}
        <div className="flex-grow p-6 sm:p-8 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro min-h-[400px] flex flex-col">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6 flex-grow">
              <div className="flex items-center gap-4 border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-4">
                <div className="w-16 h-16 rounded-xl bg-theme-orange text-theme-cream text-3xl font-extrabold flex items-center justify-center shadow-md">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={28} />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-theme-coffee dark:text-theme-darkText flex items-center gap-1.5">
                    <span>{currentUser?.displayName || 'Viewer'}</span>
                    {currentUser?.role === 'admin' && (
                      <span className="text-[10px] bg-red-650/10 text-red-600 dark:text-theme-orange px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                        <ShieldCheck size={12} />
                        Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 font-semibold">{currentUser?.email}</p>
                </div>
              </div>

              {message && (
                <div className="p-3 bg-green-550/15 border border-green-550/30 text-green-700 dark:text-green-500 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check size={14} />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Club Display Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!editMode || loading}
                      className="flex-grow px-3 py-2 rounded-xl text-sm bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-theme-orange/40 disabled:opacity-75"
                    />
                    {editMode ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-theme-orange hover:bg-theme-orange-light text-theme-cream font-bold text-xs rounded-xl shadow transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? '...' : t('common.save')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="px-3.5 py-2 bg-theme-coffee/10 hover:bg-theme-coffee/15 dark:bg-theme-darkBg text-theme-coffee dark:text-theme-darkText rounded-xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t border-theme-coffee/5 dark:border-theme-darkBorder pt-4 mt-2">
                  <span className="text-xs font-bold text-theme-coffee/50 dark:text-theme-darkText/40">Account Details:</span>
                  <div className="flex justify-between items-center text-xs py-1 border-b border-theme-coffee/5 dark:border-theme-darkBorder">
                    <span className="text-theme-coffee/60 dark:text-theme-darkText/50">Club ID:</span>
                    <span className="font-mono text-theme-coffee dark:text-theme-darkText">{currentUser?.uid}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1">
                    <span className="text-theme-coffee/60 dark:text-theme-darkText/50">Membership:</span>
                    <span className="font-semibold text-theme-orange">Gold Kid Member</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: WATCH HISTORY */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4 flex-grow">
              <div className="flex justify-between items-center border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-3">
                <h3 className="text-base font-bold text-theme-coffee dark:text-theme-darkText">
                  Chronological Watch Logs
                </h3>
                {watchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-550/10 hover:bg-red-550/20 text-red-650 dark:text-red-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {watchHistory.length > 0 ? (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-2">
                  {watchHistory.map((item, idx) => {
                    const percentage = item.duration > 0 ? Math.round((item.progress / item.duration) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(item.episodeNumber ? `/watch/${item.showId}/${item.episodeId}` : `/watch/${item.showId}`)}
                        className="flex gap-4 p-3 rounded-xl hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBg border border-theme-coffee/5 dark:border-theme-darkBorder transition-all duration-200 cursor-pointer group shrink-0"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-28 aspect-[16/10] rounded-lg overflow-hidden bg-theme-coffee/5 flex-shrink-0">
                          <img src={item.showThumbnail} alt={item.showTitle} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                            <ArrowRight size={14} className="text-theme-cream opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>

                        {/* Text fields */}
                        <div className="flex-grow flex flex-col justify-center min-w-0">
                          <h4 className="font-extrabold text-sm text-theme-coffee dark:text-theme-darkText truncate group-hover:text-theme-orange transition-colors">
                            {item.showTitle}
                          </h4>
                          {item.episodeNumber ? (
                            <p className="text-[11px] text-theme-orange font-bold uppercase tracking-wider">
                              {t('common.episodes')} {item.episodeNumber}
                            </p>
                          ) : (
                            <p className="text-[11px] text-theme-orange font-bold uppercase tracking-wider">
                              Movie
                            </p>
                          )}
                          <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 truncate font-semibold">
                            {item.episodeNumber ? item.episodeTitle : 'Full Movie'}
                          </p>
                          
                          {/* Progress bar inside log */}
                          <div className="flex items-center gap-2 mt-2 w-32">
                            <div className="flex-grow h-1 bg-theme-coffee/10 dark:bg-theme-darkBorder rounded-full overflow-hidden">
                              <div className="h-full bg-theme-orange" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-theme-coffee/40 dark:text-theme-darkText/40">{percentage}%</span>
                          </div>
                        </div>

                        {/* Date field */}
                        <span className="text-[10px] text-theme-coffee/40 dark:text-theme-darkText/30 self-center hidden sm:inline">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow py-12 text-center">
                  <History size={36} className="text-theme-coffee/20 dark:text-theme-darkText/20 mb-2" />
                  <p className="text-sm font-bold text-theme-coffee/70 dark:text-theme-darkText/70">{t('profile.historyEmpty')}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APP SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 flex-grow">
              <h3 className="text-base font-bold text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-3">
                App & Playback Configuration
              </h3>

              {/* Theme Settings row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme-coffee/5 dark:border-theme-darkBorder">
                <div>
                  <h4 className="text-sm font-bold text-theme-coffee dark:text-theme-darkText">{t('common.theme')}</h4>
                  <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-0.5">Toggle between dark night mode and soft light morning styles.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-coffee/5 border border-theme-coffee/10 hover:bg-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder rounded-xl text-xs font-bold transition-all cursor-pointer text-theme-coffee dark:text-theme-darkText self-start sm:self-center"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon size={14} className="text-theme-orange" />
                      <span>{t('common.dark')} Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun size={14} className="text-theme-orange" />
                      <span>{t('common.light')} Theme</span>
                    </>
                  )}
                </button>
              </div>

              {/* Language Settings row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme-coffee/5 dark:border-theme-darkBorder">
                <div>
                  <h4 className="text-sm font-bold text-theme-coffee dark:text-theme-darkText">{t('common.language')}</h4>
                  <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-0.5">Change language and instant text translations of shows.</p>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleLangSelect('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      currentLang.startsWith('en')
                        ? 'bg-theme-orange border-theme-orange text-theme-cream'
                        : 'bg-theme-coffee/5 border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/10'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLangSelect('ta')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      currentLang.startsWith('ta')
                        ? 'bg-theme-orange border-theme-orange text-theme-cream'
                        : 'bg-theme-coffee/5 border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText hover:bg-theme-coffee/10'
                    }`}
                  >
                    தமிழ் (Tamil)
                  </button>
                </div>
              </div>

              {/* Custom Retro CRT Filter Global Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-theme-coffee dark:text-theme-darkText flex items-center gap-1.5">
                    <Tv size={15} />
                    <span>Global Retro CRT Filter</span>
                  </h4>
                  <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-0.5">Applies vintage CRT phosphors and scans lines over players globally.</p>
                </div>
                <button
                  onClick={toggleCrtFilter}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer self-start sm:self-center ${
                    crtEnabled
                      ? 'bg-theme-orange border-theme-orange text-theme-cream shadow-md'
                      : 'bg-theme-coffee/5 border-theme-coffee/10 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee/85 dark:text-theme-darkText/85 hover:bg-theme-coffee/10'
                  }`}
                >
                  {crtEnabled ? 'CRT: Enabled' : 'CRT: Disabled'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
