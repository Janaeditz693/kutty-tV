import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './firebase';
import { MOCK_SHOWS, MOCK_COLLECTIONS } from '../constants/mockData';

// Helper to initialize and retrieve shows from local storage
const getLocalShows = () => {
  const localData = localStorage.getItem('kuttytv_db_shows');
  if (localData) {
    const parsed = JSON.parse(localData);
    const containsOldMock = parsed.some(s => s.id === 'retro-lab');
    if (containsOldMock) {
      localStorage.removeItem('kuttytv_db_shows');
    } else if (parsed.length > 0) {
      return parsed;
    }
  }
  // If not in local storage or empty, seed it and return
  localStorage.setItem('kuttytv_db_shows', JSON.stringify(MOCK_SHOWS));
  return MOCK_SHOWS;
};

const saveLocalShows = (shows) => {
  localStorage.setItem('kuttytv_db_shows', JSON.stringify(shows));
};

// Helper for comments in mock mode
const getLocalComments = (itemId) => {
  const localComments = localStorage.getItem(`kuttytv_comments_${itemId}`);
  return localComments ? JSON.parse(localComments) : [
    {
      id: `comment-mock-1`,
      userId: 'mock-user-1',
      userName: 'Toby Retro',
      userInitials: 'TR',
      text: 'This episode takes me back to Saturday mornings with a bowl of cereal. Absolute masterpiece!',
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    },
    {
      id: `comment-mock-2`,
      userId: 'mock-user-2',
      userName: 'SummerHolidays98',
      userInitials: 'SH',
      text: 'The theme song is so nostalgic, I literally remember humming this on the school bus!',
      timestamp: Date.now() - 3600000 * 24, // 1 day ago
    }
  ];
};

const saveLocalComments = (itemId, comments) => {
  localStorage.setItem(`kuttytv_comments_${itemId}`, JSON.stringify(comments));
};

// -------------------------------------------------------------
// UNIFIED DB SERVICE API
// -------------------------------------------------------------

// Collections API
export const getCollections = async () => {
  if (isFirebaseConfigured && firestore) {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'collections'));
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length === 0) {
        // Auto seed collections to new Firebase database
        for (const col of MOCK_COLLECTIONS) {
          await setDoc(doc(firestore, 'collections', col.id), col);
        }
        return MOCK_COLLECTIONS;
      }
      return list;
    } catch (err) {
      console.warn("Firestore error, falling back to mock collections:", err);
      return MOCK_COLLECTIONS;
    }
  }
  return MOCK_COLLECTIONS;
};

// Shows API (returns both shows and movies)
export const getAllCatalogItems = async () => {
  if (isFirebaseConfigured && firestore) {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'shows'));
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length === 0) {
        // Auto seed shows to new Firebase database
        for (const show of MOCK_SHOWS) {
          await setDoc(doc(firestore, 'shows', show.id), show);
        }
        return MOCK_SHOWS;
      }
      return list;
    } catch (err) {
      console.warn("Firestore error, falling back to mock shows:", err);
      return getLocalShows();
    }
  }
  return getLocalShows();
};

export const getCatalogItemById = async (id) => {
  if (isFirebaseConfigured && firestore) {
    try {
      const docRef = doc(firestore, 'shows', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn("Firestore error, falling back to local search:", err);
    }
  }
  const shows = getLocalShows();
  return shows.find(s => s.id === id) || null;
};

// Comments API
export const getComments = async (itemId) => {
  if (isFirebaseConfigured && firestore) {
    try {
      const q = query(
        collection(firestore, `shows/${itemId}/comments`),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.warn("Firestore comments error, using mock:", err);
      return getLocalComments(itemId);
    }
  }
  return getLocalComments(itemId);
};

export const addComment = async (itemId, user, text) => {
  const newComment = {
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    userInitials: user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'AN',
    text,
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && firestore) {
    try {
      const docRef = await addDoc(collection(firestore, `shows/${itemId}/comments`), newComment);
      return { id: docRef.id, ...newComment };
    } catch (err) {
      console.error("Firestore comment write failed:", err);
    }
  }

  // Local storage fallback
  const comments = getLocalComments(itemId);
  const commentWithId = { id: `comment-local-${Date.now()}`, ...newComment };
  comments.unshift(commentWithId);
  saveLocalComments(itemId, comments);
  return commentWithId;
};

// -------------------------------------------------------------
// ADMIN CRUD API (syncs local storage copy immediately)
// -------------------------------------------------------------

export const saveCatalogItem = async (item) => {
  // 1. Write to database layer (Firebase if available)
  if (isFirebaseConfigured && firestore) {
    try {
      const showRef = doc(firestore, 'shows', item.id);
      await setDoc(showRef, item, { merge: true });
    } catch (err) {
      console.error("Firestore save failed:", err);
    }
  }

  // 2. Always sync our local storage copy so the UI is updated instantly
  const shows = getLocalShows();
  const index = shows.findIndex(s => s.id === item.id);
  if (index !== -1) {
    shows[index] = item;
  } else {
    shows.push(item);
  }
  saveLocalShows(shows);
  return item;
};

export const deleteCatalogItem = async (id) => {
  if (isFirebaseConfigured && firestore) {
    try {
      await deleteDoc(doc(firestore, 'shows', id));
    } catch (err) {
      console.error("Firestore delete failed:", err);
    }
  }

  const shows = getLocalShows();
  const updated = shows.filter(s => s.id !== id);
  saveLocalShows(updated);
  return true;
};

// Sync user profile to Firestore or localStorage (handles promotion roles dynamically)
export const syncUserProfile = async (user) => {
  if (!user) return null;
  const defaultAdminEmail = 'vjana0640@gmail.com';
  
  if (isFirebaseConfigured && firestore) {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || data.displayName || 'Viewer',
          role: data.role || (user.email === defaultAdminEmail ? 'admin' : 'user'),
        };
      } else {
        const role = user.email === defaultAdminEmail ? 'admin' : 'user';
        const profile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Viewer',
          role: role
        };
        await setDoc(userRef, profile);
        return profile;
      }
    } catch (err) {
      console.error("Error syncing user profile to Firestore:", err);
    }
  }
  // Mock Mode: check in localStorage users list
  const users = JSON.parse(localStorage.getItem('kuttytv_users') || '[]');
  let existing = users.find(u => u.uid === user.uid || u.email === user.email);
  if (existing) {
    // If it's the default admin, guarantee role is admin
    if (existing.email === defaultAdminEmail && existing.role !== 'admin') {
      existing.role = 'admin';
      localStorage.setItem('kuttytv_users', JSON.stringify(users));
    }
    return {
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
      role: existing.role || 'user',
    };
  } else {
    // Create new mock user record
    const role = user.email === defaultAdminEmail ? 'admin' : 'user';
    const newMock = {
      uid: user.uid || `mock-${Date.now()}`,
      email: user.email,
      displayName: user.displayName || 'Viewer',
      role: role
    };
    users.push(newMock);
    localStorage.setItem('kuttytv_users', JSON.stringify(users));
    return newMock;
  }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
  if (isFirebaseConfigured && firestore) {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ uid: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.error("Error fetching users from Firestore:", err);
    }
  }
  const users = localStorage.getItem('kuttytv_users');
  return users ? JSON.parse(users) : [];
};

// Promote or change role of a user
export const updateUserRole = async (uid, newRole) => {
  if (isFirebaseConfigured && firestore) {
    try {
      const userRef = doc(firestore, 'users', uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
      return true;
    } catch (err) {
      console.error("Error updating user role in Firestore:", err);
      return false;
    }
  }
  const users = JSON.parse(localStorage.getItem('kuttytv_users') || '[]');
  const idx = users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    users[idx].role = newRole;
    localStorage.setItem('kuttytv_users', JSON.stringify(users));
    return true;
  }
  return false;
};
