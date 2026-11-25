import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
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
      navigate('/admin/customize');
    }
  };

  useEffect(() => {
    document.title = 'Login | Tamdev CMS';
  }, []);

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">
      {/* Left Editorial Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-neutral-800/80 bg-neutral-950">
        {/* Ambient orange glow & subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="font-gambarino text-2xl text-orange-600 tracking-tight">
            Tamdev.
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-orange-600/15 text-orange-400 border border-orange-500/30">
            CMS
          </span>
        </div>

        {/* Centerpiece Copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
          className="relative z-10 max-w-md space-y-4"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-orange-500">
            Portfolio Studio
          </p>
          <h1 className="font-gambarino text-5xl leading-[1.08] text-white">
            Build With <span className="text-orange-600">Passion.</span>
          </h1>
          <p className="font-mono text-sm text-neutral-400 leading-relaxed">
            Customize themes, manage sections, and publish updates to your live portfolio in real time.
          </p>
        </motion.div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between font-mono text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Portal</span>
          </div>
          <span>© 2026 Tamdev.</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 bg-neutral-950 lg:bg-neutral-900/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-sm space-y-7"
        >
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2.5">
            <span className="font-gambarino text-2xl text-orange-600 tracking-tight">
              Tamdev.
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-orange-600/15 text-orange-400 border border-orange-500/30">
              CMS
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-xs font-mono text-neutral-400">
              Sign in with your admin credentials to continue.
            </p>
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
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

          {/* <div className="pt-2 border-t border-neutral-800/80">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to portfolio</span>
            </Link>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}
