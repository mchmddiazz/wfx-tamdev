import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Terminal } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-neutral-950 text-white px-4 py-12">
      {/* Subtle dot-matrix background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient orange spotlight behind card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-orange-600/15 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        {/* Brand Header above card */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-gambarino text-3xl text-orange-600 tracking-tight">
              Tamdev.
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-orange-600/15 text-orange-400 border border-orange-500/30">
              CMS
            </span>
          </div>
          <p className="font-mono text-xs text-neutral-500">
            Admin Studio · Sign in to continue
          </p>
        </div>

        {/* Studio Card */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-sm overflow-hidden">
          {/* Terminal-style header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80 bg-neutral-900">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-orange-600/80" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Terminal size={12} className="text-orange-500" />
              <span>auth@tamdev-cms</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
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
              className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-between px-1 font-mono text-xs text-neutral-500">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to portfolio</span>
          </Link>
          <span>© 2026 Tamdev.</span>
        </div>
      </motion.div>
    </div>
  );
}
