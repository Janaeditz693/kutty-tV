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

  // Save changes locally or in Firebase
  const syncData = async (newFavs, newHistory, newContinue) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    if (isFirebaseConfigured && firestore) {
      try {
        const userDocRef = doc(firestore, 'users', uid);
        await setDoc(userDocRef, {
          favorites: newFavs,
          watchHistory: newHistory,
          continueWatching: newContinue
        }, { merge: true });
      } catch (err) {
        console.error("Error syncing with Firestore:", err);
      }
    } else {
      // Mock Mode
      localStorage.setItem(`kuttytv_favs_${uid}`, JSON.stringify(newFavs));
      localStorage.setItem(`kuttytv_history_${uid}`, JSON.stringify(newHistory));
      localStorage.setItem(`kuttytv_continue_${uid}`, JSON.stringify(newContinue));
    }
  };

  const toggleFavorite = (show) => {
    const isFav = favorites.some(f => f.id === show.id);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== show.id);
    } else {
      updated = [...favorites, show];
    }
    setFavorites(updated);
    syncData(updated, watchHistory, continueWatching);
  };

  const addToHistory = (show, episode, progress = 0, duration = 0) => {
    if (!currentUser) return;
    
    // 1. Update Watch History
    const historyItem = {
      showId: show.id,
      showTitle: show.title,
      showThumbnail: show.thumbnail,
      episodeId: episode.id,
      episodeTitle: episode.title,
      episodeNumber: episode.number,
      timestamp: Date.now(),
      progress,
      duration
    };
    
    const updatedHistory = [historyItem, ...watchHistory.filter(h => !(h.showId === show.id && h.episodeId === episode.id))].slice(0, 50); // limit to last 50 items
    setWatchHistory(updatedHistory);

    // 2. Update Continue Watching row
    const continueItem = {
      showId: show.id,
      showTitle: show.title,
      showThumbnail: show.thumbnail,
      episodeId: episode.id,
      episodeTitle: episode.title,
      episodeNumber: episode.number,
      timestamp: Date.now(),
      progress,
      duration
    };

    const updatedContinue = [continueItem, ...continueWatching.filter(c => c.showId !== show.id)].slice(0, 10);
    setContinueWatching(updatedContinue);

    syncData(favorites, updatedHistory, updatedContinue);
  };

  const removeFromContinueWatching = (showId) => {
    const updatedContinue = continueWatching.filter(c => c.showId !== showId);
    setContinueWatching(updatedContinue);
    syncData(favorites, watchHistory, updatedContinue);
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
