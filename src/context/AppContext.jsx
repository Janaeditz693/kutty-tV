import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from '../services/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);

  // Fetch data depending on Firebase state vs Mock Mode
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setWatchHistory([]);
      setContinueWatching([]);
      return;
    }

    const uid = currentUser.uid;

    if (isFirebaseConfigured && firestore) {
      // Firebase Mode
      const userDocRef = doc(firestore, 'users', uid);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.favorites || []);
          setWatchHistory(data.watchHistory || []);
          setContinueWatching(data.continueWatching || []);
        } else {
          // Initialize empty user doc in firestore
          setDoc(userDocRef, {
            favorites: [],
            watchHistory: [],
            continueWatching: []
          });
        }
      });

      return () => unsubscribe();
    } else {
      // Mock Mode: load from local storage
      const localFavs = localStorage.getItem(`kuttytv_favs_${uid}`);
      const localHistory = localStorage.getItem(`kuttytv_history_${uid}`);
      const localContinue = localStorage.getItem(`kuttytv_continue_${uid}`);

      setFavorites(localFavs ? JSON.parse(localFavs) : []);
      setWatchHistory(localHistory ? JSON.parse(localHistory) : []);
      setContinueWatching(localContinue ? JSON.parse(localContinue) : []);
    }
  }, [currentUser]);

  // Helper to remove any undefined fields before writing to Firestore
  const sanitizeForFirestore = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
    const cleaned = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val === undefined) {
        cleaned[key] = null;
      } else if (val && typeof val === 'object') {
        cleaned[key] = sanitizeForFirestore(val);
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  };

  // Save changes locally or in Firebase
  const syncData = async (newFavs, newHistory, newContinue) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const cleanFavs = sanitizeForFirestore(newFavs);
    const cleanHistory = sanitizeForFirestore(newHistory);
    const cleanContinue = sanitizeForFirestore(newContinue);

    if (isFirebaseConfigured && firestore) {
      try {
        const userDocRef = doc(firestore, 'users', uid);
        await setDoc(userDocRef, {
          favorites: cleanFavs,
          watchHistory: cleanHistory,
          continueWatching: cleanContinue
        }, { merge: true });
      } catch (err) {
        console.error("Error syncing with Firestore:", err);
      }
    } else {
      // Mock Mode
      localStorage.setItem(`kuttytv_favs_${uid}`, JSON.stringify(cleanFavs));
      localStorage.setItem(`kuttytv_history_${uid}`, JSON.stringify(cleanHistory));
      localStorage.setItem(`kuttytv_continue_${uid}`, JSON.stringify(cleanContinue));
    }
  };

  const toggleFavorite = (show) => {
    if (!show) return;
    const isFav = favorites.some(f => f.id === show.id);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== show.id);
    } else {
      const sanitizedShow = {
        id: show.id || '',
        title: show.title || '',
        titleTa: show.titleTa || '',
        thumbnail: show.thumbnail || '',
        banner: show.banner || '',
        type: show.type || 'show',
        rating: show.rating || '5.0',
        year: show.year || '2024',
        genres: show.genres || [],
        languages: show.languages || []
      };
      updated = [...favorites, sanitizedShow];
    }
    setFavorites(updated);
    syncData(updated, watchHistory, continueWatching);
  };

  const addToHistory = (show, episode, progress = 0, duration = 0) => {
    if (!currentUser || !show) return;

    const isMovie = show.type === 'movie' || !episode || episode.id === show.id;
    const epId = isMovie ? null : (episode?.id || null);
    const epTitle = isMovie ? null : (episode?.title || null);
    const epNum = isMovie ? null : (episode?.number || null);

    const historyItem = {
      showId: show.id || '',
      showTitle: show.title || '',
      showThumbnail: show.thumbnail || '',
      type: show.type || (isMovie ? 'movie' : 'show'),
      episodeId: epId,
      episodeTitle: epTitle,
      episodeNumber: epNum,
      timestamp: Date.now(),
      progress: Number(progress) || 0,
      duration: Number(duration) || 0
    };

    const continueItem = { ...historyItem };

    let nextHistory = [];
    setWatchHistory(prevHistory => {
      const filteredHistory = prevHistory.filter(h => {
        if (h.showId !== show.id) return true;
        if (isMovie) return false;
        return h.episodeId !== epId;
      });
      nextHistory = [historyItem, ...filteredHistory].slice(0, 50);
      return nextHistory;
    });

    let nextContinue = [];
    setContinueWatching(prevContinue => {
      const filteredContinue = prevContinue.filter(c => c.showId !== show.id);
      nextContinue = [continueItem, ...filteredContinue].slice(0, 10);
      return nextContinue;
    });

    syncData(favorites, nextHistory, nextContinue);
  };

  const removeFromContinueWatching = (showId) => {
    let nextContinue = [];
    setContinueWatching(prevContinue => {
      nextContinue = prevContinue.filter(c => c.showId !== showId);
      return nextContinue;
    });
    syncData(favorites, watchHistory, nextContinue);
  };

  const clearHistory = () => {
    setWatchHistory([]);
    setContinueWatching([]);
    syncData(favorites, [], []);
  };

  return (
    <AppContext.Provider value={{
      favorites,
      watchHistory,
      continueWatching,
      toggleFavorite,
      isFavorite: (showId) => favorites.some(f => f.id === showId),
      addToHistory,
      removeFromContinueWatching,
      clearHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
