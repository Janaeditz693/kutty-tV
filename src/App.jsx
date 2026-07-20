import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const Search = lazy(() => import('./pages/Search'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
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
        <main className="flex-grow pb-16 md:pb-0">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
              <Route path="/shows" element={<AnimatedPage><Shows /></AnimatedPage>} />
              <Route path="/movies" element={<AnimatedPage><Movies /></AnimatedPage>} />
              <Route path="/search" element={<AnimatedPage><Search /></AnimatedPage>} />
              <Route path="/login" element={<AnimatedPage><Auth /></AnimatedPage>} />
              
              {/* Watch pages (support optional episode param) */}
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
