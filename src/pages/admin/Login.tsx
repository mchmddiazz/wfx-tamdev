import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/admin/projects');
    }
  };

  useEffect(() => {
    document.title = 'Login | Tamdev CMS';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        className="w-full max-w-sm space-y-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-2xl"
      >
        <h1 className="text-xl font-semibold text-orange-600 dark:text-orange-600 leading-tight">Tamdev CMS Login</h1>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-orange-600 text-black font-medium hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </motion.form>
    </div>
  );
}