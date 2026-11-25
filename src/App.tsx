import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Loading } from './components/Loading';
import { ScrollProgress } from './components/ScrollProgress';
import { SectionRenderer } from './components/SectionRenderer';
import { supabase } from './lib/supabase';
import { DEFAULT_SECTIONS } from './lib/sectionRegistry';
import { SiteSection } from './types/cms';

// Lazy-loaded Public Portfolio Navigation
const Navigation = lazy(() => import('./components/Navigation'));

// CMS Imports
import Login from './pages/admin/Login';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import ManageProjects from './pages/admin/ManageProjects';
import ManageProfile from './pages/admin/ManageProfile';
import ManageSocials from './pages/admin/ManageSocials';
import ManageWorkExperience from './pages/admin/ManageWorkExperience';
import ThemesDashboard from './pages/admin/ThemesDashboard';
import CustomizeSite from './pages/admin/CustomizeSite';
import CustomizePreview from './pages/admin/CustomizePreview';

function PortfolioPage() {
  const [searchParams] = useSearchParams();
  const previewThemeId = searchParams.get('previewThemeId');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [sections, setSections] = useState<SiteSection[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    if (!isLoading) setHasLoadedOnce(true);
  }, [isLoading]);

  useEffect(() => {
    document.title = 'Build With Passion | Tamdev* ';
  }, []);

  useEffect(() => {
    async function loadSections() {
      // 1. Prefer previewThemeId if provided, else active live theme from site_themes
      const themeQuery = previewThemeId
        ? supabase.from('site_themes').select('sections').eq('id', previewThemeId).single()
        : supabase.from('site_themes').select('sections').eq('is_live', true).single();

      const { data: themeData, error: themeErr } = await themeQuery;

      if (!themeErr && themeData?.sections && Array.isArray(themeData.sections)) {
        const visible = (themeData.sections as SiteSection[])
          .filter((s) => s.is_visible)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (visible.length > 0) {
          setSections(visible);
          return;
        }
      }

      // 2. Fallback to site_sections
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setSections(data);
      }
    }
    loadSections();
  }, [previewThemeId]);

  const navItems = sections
    .filter((s) => s.show_in_nav)
    .map((s) => ({ id: s.anchor_id, label: s.nav_label }));

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
            <Navigation items={navItems} />
            <main>
              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} mode="published" />
              ))}
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
            <Route path="/admin/customize/editor" element={<CustomizeSite />} />
            <Route path="/admin/preview" element={<CustomizePreview />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/projects" element={<ManageProjects />} />
              <Route path="/admin/profile" element={<ManageProfile />} />
              <Route path="/admin/socials" element={<ManageSocials />} />
              <Route path="/admin/experience" element={<ManageWorkExperience />} />
              <Route path="/admin/customize" element={<ThemesDashboard />} />
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
