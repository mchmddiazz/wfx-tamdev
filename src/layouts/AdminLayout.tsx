import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  UserCircle,
  Share2,
  Briefcase,
  Paintbrush,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const CONTENT_NAV = [
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/profile', label: 'Profile & Resume', icon: UserCircle },
  { to: '/admin/socials', label: 'Social Links', icon: Share2 },
  { to: '/admin/experience', label: 'Work Experience', icon: Briefcase },
];

const SITE_NAV = [
  { to: '/admin/customize', label: 'Customize', icon: Paintbrush },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/projects': 'Projects | Tamdev CMS',
  '/admin/profile': 'Profile & Resume | Tamdev CMS',
  '/admin/socials': 'Social Links | Tamdev CMS',
  '/admin/experience': 'Work Experience | Tamdev CMS',
  '/admin/customize': 'Online Site & Themes | Tamdev CMS',
};

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/wfx-login');
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand + User */}
        <div className="px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-600 inline-block" />
            <span className="font-bold text-orange-500 tracking-tight text-base">
              Tamdev CMS
            </span>
          </div>
          {userEmail && (
            <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800/60 border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span title={userEmail} className="text-[11px] font-mono text-neutral-300 truncate">
                {userEmail}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Content
          </p>
          {CONTENT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100'
                  }`
                }
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sales Channel / Online Site */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Online Site
          </p>
          {SITE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                      : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100'
                  }`
                }
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1.5 border-t border-neutral-800 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition"
        >
          <span>View Live Site</span>
          <ExternalLink size={13} />
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-neutral-900 border-r border-neutral-800 p-4 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open admin menu"
            className="p-1.5 -ml-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-orange-500 tracking-tight text-base">
            Tamdev CMS
          </span>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
        >
          <span>Live</span>
          <ExternalLink size={12} />
        </a>
      </header>

      {/* Mobile Slide-Over Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              key="admin-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              key="admin-sidebar-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-64 max-w-[80vw] h-full bg-neutral-900 border-r border-neutral-800 p-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close admin menu"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X size={18} />
              </button>
              {renderNavContent()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
