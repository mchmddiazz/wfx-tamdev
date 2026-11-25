import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Loading } from './components/Loading';
import { ScrollProgress } from './components/ScrollProgress';

// Lazy-loaded Public Portfolio Components
const Navigation = lazy(() => import('./components/Navigation'));
const Hero       = lazy(() => import('./components/Hero'));
const About      = lazy(() => import('./components/About'));
// const Value      = lazy(() => import('./components/Value'));
const Background = lazy(() => import('./components/Background'));
const Work       = lazy(() => import('./components/Work'));
const Contact    = lazy(() => import('./components/Contact'));

// CMS Imports
import Login from './pages/admin/Login';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import ManageProjects from './pages/admin/ManageProjects';
import ManageProfile from './pages/admin/ManageProfile';
import ManageSocials from './pages/admin/ManageSocials';
import ManageWorkExperience from './pages/admin/ManageWorkExperience';

function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isLoading) setHasLoadedOnce(true);
  }, [isLoading]);

  useEffect(() => {
    document.title = 'Build With Passion | Tamdev* '; // replace with your exact index.html <title> if different
  }, []);

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-black transition-colors relative z-0">
      <AnimatePresence mode="wait">
        {isLoading && !hasLoadedOnce && (
          <Loading setIsLoading={setIsLoading} />
        )}
      </AnimatePresence>

      {(!isLoading || hasLoadedOnce) && (
        <Suspense fallback={null}>
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="pb-safe-bottom"
          >
            <ScrollProgress />
            <Navigation />
            <main>
              <Hero />
              <About />
              {/* <Value /> */}
              <Background />
              <Work />
              <Contact />
            </main>
          </motion.div>
        </Suspense>
      )}
    </div>
  );
}

function AnimatedAppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname.startsWith('/admin') ? 'admin' : location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location} key={location.pathname}>
          {/* Public Portfolio with Intro Loader */}
          <Route path="/" element={<PortfolioPage />} />

          {/* Admin Login Route */}
          <Route path="/wfx-login" element={<Login />} />

          {/* Protected Admin CMS Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/projects" element={<ManageProjects />} />
              <Route path="/admin/profile" element={<ManageProfile />} />
              <Route path="/admin/socials" element={<ManageSocials />} />
              <Route path="/admin/experience" element={<ManageWorkExperience />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatedAppRoutes />
        <SpeedInsights />
      </BrowserRouter>
    </ThemeProvider>
  );
}