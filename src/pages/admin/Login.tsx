import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/themes');
    }
  };

  useEffect(() => {
    document.title = 'Login | Tamdev CMS';
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-neutral-950 text-white px-4 py-12">
      {/* Animated ambient gradient orbs */}
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -30, 20, 0], y: [0, 25, -15, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* Floating Glassmorphic Console */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm rounded-2xl backdrop-blur-xl bg-neutral-900/65 border border-white/10 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Crisp 1px top highlight */}
        <div
          aria-hidden="true"
          className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/60 to-transparent"
        />

        <div className="p-7 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-gambarino text-2xl text-orange-500 tracking-tight">
                  Tamdev.
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-neutral-300 border border-white/10">
                  CMS
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Sign in to your studio console
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-orange-600/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Sparkles size={14} />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-sm font-medium shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs text-neutral-500">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to portfolio</span>
            </Link>
            <span>© 2026</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
