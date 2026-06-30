import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import { useAuth } from './context/AuthContext';

// Lazy loading all pages for code-splitting and performance
const Home = lazy(() => import('./pages/Home'));
const Shows = lazy(() => import('./pages/Shows'));
const Movies = lazy(() => import('./pages/Movies'));
const Collections = lazy(() => import('./pages/Collections'));
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
              <Route path="/" element={<Home />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Auth />} />
              
              {/* Watch pages (support optional episode param) */}
              <Route path="/watch/:showId" element={<Watch />} />
              <Route path="/watch/:showId/:episodeId" element={<Watch />} />

              {/* Protected Member Views */}
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Staff views */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
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
        
      </div>
    </Router>
  );
}

export default App;
