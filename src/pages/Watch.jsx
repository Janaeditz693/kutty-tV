import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Plus, Check, Play, User as UserIcon, Share2 } from 'lucide-react';
import Player from '../components/Player';
import Carousel from '../components/Carousel';
import CartoonCard from '../components/CartoonCard';
import Skeleton from '../components/Skeleton';
import { getCatalogItemById, getAllCatalogItems, getComments, addComment } from '../services/db';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Watch = () => {
  const { t, i18n } = useTranslation();
  const { showId, episodeId } = useParams();
  const navigate = useNavigate();
  
  const { currentUser } = useAuth();
  const { toggleFavorite, isFavorite, addToHistory, watchHistory, continueWatching } = useApp();

  const handleShare = async () => {
    const shareData = {
      title: item?.title || 'Kutty TV',
      text: item?.description || 'Watch on Kutty TV',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  // Page States
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);

  // Load theater mode settings on event triggers
  useEffect(() => {
    const handleTheaterToggle = (e) => {
      setIsTheaterMode(e.detail);
    };
    window.addEventListener('theaterModeChanged', handleTheaterToggle);
    return () => window.removeEventListener('theaterModeChanged', handleTheaterToggle);
  }, []);

  // Fetch show details and full catalog
  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const [showData, allItems] = await Promise.all([
          getCatalogItemById(showId),
          getAllCatalogItems()
        ]);
        
        if (!showData) {
          navigate('/', { replace: true });
          return;
        }

        setItem(showData);
        setCatalogItems(allItems);

        // Fetch comments
        const commentsList = await getComments(showId);
        setComments(commentsList);

        // Resolve current episode if show
        if (showData.type === 'show') {
          const episodes = showData.episodes || [];
          let activeEp = null;
          
          if (episodeId) {
            activeEp = episodes.find(e => e.id === episodeId);
          }
          // Default to first episode if invalid or not specified
          if (!activeEp && episodes.length > 0) {
            activeEp = episodes[0];
          }
          setCurrentEpisode(activeEp);
          if (activeEp) {
            setActiveSeason(activeEp.season || 1);
          }
        } else {
          // It's a movie
          setCurrentEpisode(null);
        }
      } catch (err) {
        console.error("Error loading watch data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [showId, episodeId, navigate]);

  const lastSaveTimeRef = React.useRef(0);

  // Handle watch progress tracking
  const handleTimeUpdate = (currentTime, duration) => {
    if (!item) return;
    // Don't track if video is just starting
    if (currentTime < 2) return;

    // Throttle progress updates to at most once every 5 seconds
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 5000) return;
    lastSaveTimeRef.current = now;

    // Track progress in context (which updates Continue Watching row & Firestore)
    const targetPlayable = currentEpisode || item;
    addToHistory(item, targetPlayable, Math.floor(currentTime), Math.floor(duration));
  };

  const handleNextEpisode = () => {
    if (!item || item.type !== 'show') return;
    const episodes = item.episodes || [];
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      const nextEp = episodes[currentIndex + 1];
      navigate(`/watch/${item.id}/${nextEp.id}`);
    }
  };

  const handlePrevEpisode = () => {
    if (!item || item.type !== 'show') return;
    const episodes = item.episodes || [];
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex > 0) {
      const prevEp = episodes[currentIndex - 1];
      navigate(`/watch/${item.id}/${prevEp.id}`);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setPostingComment(true);
      const commentObj = await addComment(showId, currentUser, newComment.trim());
      setComments((prev) => [commentObj, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading || !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
        <Skeleton variant="hero" className="w-full" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow flex flex-col gap-3">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-full" />
          </div>
          <div className="w-full md:w-80 flex flex-col gap-4">
            <Skeleton variant="card" className="w-full" />
            <Skeleton variant="card" className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(item.id);
  const currentLang = i18n.language || 'en';
  
  const displayTitle = currentLang.startsWith('ta') && item.titleTa ? item.titleTa : item.title;
  const displayDesc = currentLang.startsWith('ta') && item.descriptionTa ? item.descriptionTa : item.description;

  const currentEpTitle = currentEpisode 
    ? (currentLang.startsWith('ta') && currentEpisode.titleTa ? currentEpisode.titleTa : currentEpisode.title)
    : '';

  // Get active video url and meta details
  const videoUrl = item.type === 'movie' ? item.videoUrl : (currentEpisode?.videoUrl || '');
  const mediaTitle = item.type === 'movie' ? displayTitle : `${displayTitle} - Ep ${currentEpisode?.number}: ${currentEpTitle}`;

  // Next / Prev button conditions
  const episodes = item.episodes || [];
  const availableSeasons = [...new Set(episodes.map(ep => ep.season || 1))].sort((a, b) => a - b);
  const filteredEpisodes = episodes.filter(ep => (ep.season || 1) === activeSeason);

  const activeIndex = currentEpisode ? episodes.findIndex(e => e.id === currentEpisode.id) : -1;
  const hasNext = item.type === 'show' && activeIndex !== -1 && activeIndex < episodes.length - 1;
  const hasPrev = item.type === 'show' && activeIndex > 0;

  // Recommendations: exclude current show, get shows of same category/genres
  const recommendations = catalogItems
    .filter(c => c.id !== item.id)
    .slice(0, 4);

  return (
    <div className="w-full pb-12">
      
      {/* 1. Video Player Section (Dynamic layout under Theater mode) */}
      <div className={`w-full bg-black/5 dark:bg-black/50 ${isTheaterMode ? 'w-full' : 'max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8'}`}>
        <Player
          key={`${item.id}-${currentEpisode?.id || 'movie'}`}
          videoUrl={videoUrl}
          title={mediaTitle}
          onNext={handleNextEpisode}
          onPrev={handlePrevEpisode}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onTimeUpdate={handleTimeUpdate}
          onVideoEnded={handleNextEpisode}
        />
      </div>

      {/* 2. Main Page content grids */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className={`grid gap-8 ${isTheaterMode ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>
          
          {/* LEFT CONTENT COLUMN (Show titles, Desc, comments) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Show/Movie Details Box */}
            <div className="flex flex-col gap-3 pb-6 border-b border-theme-coffee/10 dark:border-theme-darkBorder">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText">
                    {displayTitle}
                  </h1>
                  {currentEpisode && (
                    <h2 className="text-base sm:text-lg font-bold text-theme-orange mt-0.5">
                      {t('common.episodes')} {currentEpisode.number}: {currentEpTitle}
                    </h2>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Favorite Toggle button */}
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-theme-coffee/5 border border-theme-coffee/10 hover:bg-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {isFav ? (
                      <>
                        <Check size={14} className="text-green-600 dark:text-green-500" />
                        <span>{t('common.addedToList')}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{t('common.addToList')}</span>
                      </>
                    )}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2 bg-theme-coffee/5 border border-theme-coffee/10 hover:bg-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Share2 size={14} className="text-theme-orange" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">
                <span className="px-2 py-0.5 bg-amber-500 rounded text-black flex items-center gap-1 font-extrabold shadow-sm">
                  <Star size={11} className="fill-black stroke-none" />
                  {item.rating}
                </span>
                <span>{item.year}</span>
                <span>|</span>
                <span>{item.genres?.join(', ')}</span>
                <span>|</span>
                <span className="text-theme-orange">
                  {item.languages?.join(' / ')}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-theme-coffee/70 dark:text-theme-darkText/75 leading-relaxed font-medium mt-1">
                {displayDesc}
              </p>
            </div>

            {/* DISCUSSION & COMMENTS SECTION */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-extrabold text-theme-coffee dark:text-theme-darkText flex items-center gap-2">
                <MessageSquare size={18} className="text-theme-orange" />
                <span>{t('watch.comments')} ({comments.length})</span>
              </h3>

              {/* Comment submission form */}
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-theme-orange text-theme-cream font-bold flex items-center justify-center shadow-inner shrink-0">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                  </div>
                  <div className="flex-grow flex flex-col gap-2">
                    <textarea
                      rows="3"
                      placeholder={t('watch.addComment')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={postingComment}
                      className="w-full p-3 text-sm rounded-xl bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none focus:ring-2 focus:ring-theme-orange/40"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || postingComment}
                      className="self-end px-4 py-2 bg-theme-orange hover:bg-theme-orange-light text-theme-cream font-bold text-xs rounded-xl shadow cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {postingComment ? '...' : t('watch.postComment')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-theme-coffee/5 border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder text-center">
                  <p className="text-xs text-theme-coffee/60 dark:text-theme-darkText/50 font-semibold">
                    Want to share a cartoon memory? 
                    <Link to={`/login?redirect=/watch/${showId}`} className="text-theme-orange hover:underline font-bold ml-1">
                      Log in here
                    </Link> to join the discussion.
                  </p>
                </div>
              )}

              {/* Comments list */}
              <div className="flex flex-col gap-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBg/50 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-theme-coffee dark:bg-theme-darkBorder text-theme-cream text-xs font-bold flex items-center justify-center shrink-0">
                        {comment.userInitials}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-theme-coffee dark:text-theme-darkText">{comment.userName}</span>
                          <span className="text-[10px] text-theme-coffee/40 dark:text-theme-darkText/30 font-semibold">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-theme-coffee/80 dark:text-theme-darkText/70 mt-1 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-theme-coffee/50 dark:text-theme-darkText/40 italic py-4">
                    {t('watch.noComments')}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (Episode lists, related suggestions) */}
          <div className="flex flex-col gap-6">
            
            {/* Show episodes navigation panel */}
            {item.type === 'show' && episodes.length > 0 && (
              <div className="flex flex-col gap-3 p-4 rounded-premium bg-theme-beige/20 border border-theme-coffee/10 dark:bg-theme-darkCard/40 dark:border-theme-darkBorder">
                <h3 className="text-sm sm:text-base font-extrabold text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                  {t('watch.episodesList')} ({filteredEpisodes.length})
                </h3>

                {availableSeasons.length > 1 && (
                  <div className="flex gap-2 pb-2 border-b border-theme-coffee/10 dark:border-theme-darkBorder overflow-x-auto no-scrollbar shrink-0">
                    {availableSeasons.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSeason(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          activeSeason === s
                            ? 'bg-theme-orange border-theme-orange text-theme-cream shadow'
                            : 'bg-theme-cream border-theme-coffee/10 text-theme-coffee dark:bg-theme-darkBg dark:border-theme-darkBorder dark:text-theme-darkText hover:bg-theme-coffee/5'
                        }`}
                      >
                        Season {s}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                  {filteredEpisodes.map((ep) => {
                    const isActive = currentEpisode?.id === ep.id;
                    const epTitleStr = currentLang.startsWith('ta') && ep.titleTa ? ep.titleTa : ep.title;
                    
                    return (
                      <Link
                        key={ep.id}
                        to={`/watch/${showId}/${ep.id}`}
                        className={`flex gap-3 p-2 rounded-xl border transition-all duration-200 cursor-pointer items-center min-w-0 ${
                          isActive
                            ? 'bg-theme-orange border-theme-orange text-theme-cream'
                            : 'bg-theme-cream border-theme-coffee/5 hover:bg-theme-coffee/5 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText'
                        }`}
                      >
                        <div className="relative w-20 aspect-[16/10] rounded-lg overflow-hidden shrink-0 bg-theme-coffee/10">
                          <img src={ep.thumbnail} alt={epTitleStr} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 flex items-center justify-center bg-black/25 ${isActive ? 'bg-black/10' : ''}`}>
                            <Play size={12} className="fill-theme-cream text-theme-cream" />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-theme-cream/80' : 'text-theme-orange'}`}>
                            {t('common.episodes')} {ep.number}
                          </p>
                          <h4 className="text-xs font-bold truncate tracking-wide">
                            {epTitleStr}
                          </h4>
                          <span className={`text-[9px] font-semibold ${isActive ? 'text-theme-cream/60' : 'text-theme-coffee/40 dark:text-theme-darkText/40'}`}>
                            {Math.round(ep.duration / 60)} min
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations Widget */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                {t('watch.related')}
              </h3>

              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4">
                {recommendations.map((rec) => {
                  const recTitle = currentLang.startsWith('ta') && rec.titleTa ? rec.titleTa : rec.title;
                  return (
                    <Link
                      key={rec.id}
                      to={rec.type === 'movie' ? `/watch/${rec.id}` : `/watch/${rec.id}/${rec.episodes?.[0]?.id || ''}`}
                      className="flex gap-3 p-2.5 rounded-premium bg-theme-cream border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro hover:shadow hover:y-[-2px] transition-all cursor-pointer min-w-0"
                    >
                      <img
                        src={rec.thumbnail}
                        alt={recTitle}
                        className="w-20 sm:w-24 aspect-[16/10] object-cover rounded-lg bg-theme-coffee/5 shrink-0"
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-theme-coffee dark:text-theme-darkText truncate">
                          {recTitle}
                        </h4>
                        <span className="text-[10px] text-theme-orange font-bold uppercase tracking-wider mt-0.5">
                          {rec.type === 'movie' ? t('common.movies') : t('common.shows')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-theme-coffee/40 dark:text-theme-darkText/40 uppercase tracking-widest mt-0.5">
                          <span>{rec.year}</span>
                          <span>•</span>
                          <span>★ {rec.rating}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Watch;
