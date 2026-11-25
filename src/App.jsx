import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import { useAuth } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

// Lazy loading all pages for code-splitting and performance
const Home = lazy(() => import('./pages/Home'));
const Shows = lazy(() => import('./pages/Shows'));
const Movies = lazy(() => import('./pages/Movies'));
const Watch = lazy(() => import('./pages/Watch'));
const Details = lazy(() => import('./pages/Details'));
const Search = lazy(() => import('./pages/Search'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
const Welcome = lazy(() => import('./pages/Welcome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Route guards
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <Loader />;
  return currentUser ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  if (loading) return <Loader />;
  return currentUser && isAdmin ? children : <Navigate to="/" replace />;
};

// First-time visitors land on the Welcome screen once (crawlers are skipped for SEO)
const FirstVisitGate = ({ children }) => {
  const { pathname } = useLocation();
  let seen = true;
  try {
    const bot = /bot|crawl|spider|lighthouse|preview/i.test(navigator.userAgent);
    seen = bot || localStorage.getItem('kuttytv_welcomed') === '1';
  } catch { /* storage blocked: skip welcome */ }
  if (pathname === '/' && !seen) return <Navigate to="/welcome" replace />;
  return children;
};

// Reusable page transition wrapper
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-theme-cream dark:bg-theme-darkBg text-theme-coffee dark:text-theme-darkText transition-colors duration-300">
        
        {/* Navigation Head */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-grow pb-20 lg:pb-0">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<FirstVisitGate><AnimatedPage><Home /></AnimatedPage></FirstVisitGate>} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/shows" element={<AnimatedPage><Shows /></AnimatedPage>} />
              <Route path="/movies" element={<AnimatedPage><Movies /></AnimatedPage>} />
              <Route path="/search" element={<AnimatedPage><Search /></AnimatedPage>} />
              <Route path="/login" element={<AnimatedPage><Auth /></AnimatedPage>} />
              
              {/* Watch pages (support optional episode param) */}
              <Route path="/details/:showId" element={<AnimatedPage><Details /></AnimatedPage>} />
              <Route path="/watch/:showId" element={<AnimatedPage><Watch /></AnimatedPage>} />
              <Route path="/watch/:showId/:episodeId" element={<AnimatedPage><Watch /></AnimatedPage>} />

              {/* Protected Member Views */}
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <AnimatedPage><Favorites /></AnimatedPage>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <AnimatedPage><Profile /></AnimatedPage>
                  </ProtectedRoute>
                } 
              />

              {/* Protected Staff views */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AnimatedPage><AdminDashboard /></AnimatedPage>
                  </AdminRoute>
                } 
              />

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Vercel Analytics tracking */}
        <Analytics />
        
      </div>
    </Router>
  );
}

export default App;
