import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/profile', label: 'Profile & Resume' },
  { to: '/admin/socials', label: 'Social Links' },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/projects': 'Projects | Tamdev CMS',
  '/admin/profile': 'Profile & Resume | Tamdev CMS',
  '/admin/socials': 'Social Links | Tamdev CMS',
};

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch current authenticated user for mobile drawer header
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] ?? 'Admin | Tamdev CMS';
  }, [location.pathname]);

  // Close mobile sidebar automatically when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Prevent background page scroll while mobile drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Mobile Hamburger + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open admin menu"
              className="md:hidden p-2 -ml-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <span className="font-bold text-orange-500 tracking-tight text-lg">
              Tamdev CMS
            </span>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 ml-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-neutral-400 hover:text-white transition'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: Desktop Logout Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-xs text-neutral-400 hover:text-white"
            >
              View Live Site ↗
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Animated Mobile Slide-Over Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Animated Backdrop */}
            <motion.div
              key="admin-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Animated Drawer Panel */}
            <motion.aside
              key="admin-sidebar-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-64 max-w-[80vw] h-full bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between p-5 shadow-2xl"
            >
              <div>
                {/* Drawer Header with Active Session Badge */}
                <div className="border-b border-neutral-800 pb-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-500 tracking-tight text-lg">
                      Tamdev CMS
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(false)}
                      aria-label="Close admin menu"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {userEmail && (
                    <div className="mt-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800/70 border border-neutral-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span
                        title={userEmail}
                        className="text-xs font-mono text-neutral-300 truncate"
                      >
                        {userEmail}
                      </span>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <div className="my-2 border-t border-neutral-800" />

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition flex items-center justify-between"
                  >
                    <span>View Live Site</span>
                    <span>↗</span>
                  </a>
                </nav>
              </div>

              {/* Bottom Logout Action */}
              <div className="border-t border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-center"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}