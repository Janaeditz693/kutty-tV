import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { syncUserProfile } from './db';

// Helper to get local mock users
const getLocalUsers = () => {
  const users = localStorage.getItem('kuttytv_users');
  return users ? JSON.parse(users) : [
    {
      uid: 'admin-mock-id',
      email: 'vjana0640@gmail.com',
      password: 'admin123',
      displayName: 'vjana0640 (Admin)',
      role: 'admin',
      favorites: [],
      history: [],
    },
    {
      uid: 'viewer-mock-id',
      email: 'viewer@kuttytv.com',
      password: 'viewer123',
      displayName: 'Nostalgic Kid',
      role: 'user',
      favorites: [],
      history: [],
    }
  ];
};

const saveLocalUsers = (users) => {
  localStorage.setItem('kuttytv_users', JSON.stringify(users));
};

const getLocalSession = () => {
  const session = localStorage.getItem('kuttytv_session');
  return session ? JSON.parse(session) : null;
};

const setLocalSession = (user) => {
  if (user) {
    localStorage.setItem('kuttytv_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('kuttytv_session');
  }
};

export const loginWithEmail = async (email, password) => {
  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } else {
    // Mock Mode
    const users = getLocalUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const sessionUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role || 'user',
    };
    setLocalSession(sessionUser);
    return sessionUser;
  }
};

export const registerWithEmail = async (email, password, displayName) => {
  if (isFirebaseConfigured && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } else {
    // Mock Mode
    const users = getLocalUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const newUser = {
      uid: `mock-user-${Date.now()}`,
      email,
      password,
      displayName,
      role: 'user',
      favorites: [],
      history: [],
    };
    users.push(newUser);
    saveLocalUsers(users);
    
    const sessionUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
    };
    setLocalSession(sessionUser);
    return sessionUser;
  }
};

export const loginWithGoogle = async () => {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } else {
    // Mock Google Login
    const sessionUser = {
      uid: 'google-mock-id',
      email: 'vjana0640@gmail.com',
      displayName: 'vjana0640 (Google)',
      role: 'admin',
    };
    setLocalSession(sessionUser);
    return sessionUser;
  }
};

export const logout = async () => {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  } else {
    setLocalSession(null);
  }
};

export const updateProfileInfo = async (currentUser, { displayName }) => {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    await firebaseUpdateProfile(auth.currentUser, { displayName });
    return auth.currentUser;
  } else {
    // Mock Mode
    const session = getLocalSession();
    if (session) {
      session.displayName = displayName;
      setLocalSession(session);
      
      const users = getLocalUsers();
      const updatedUsers = users.map(u => 
        u.uid === session.uid ? { ...u, displayName } : u
      );
      saveLocalUsers(updatedUsers);
    }
    return { ...currentUser, displayName };
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await syncUserProfile(user);
        callback(profile);
      } else {
        callback(null);
      }
    });
  } else {
    // Mock Mode: check local session immediately and trigger callback
    const session = getLocalSession();
    callback(session);
    // Return dummy unsubscribe function
    return () => {};
  }
};
