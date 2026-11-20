import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h1 className="text-xl font-semibold text-orange-600 dark:text-orange-600 leading-tight">Tamdev CMS Login</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
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
          className="w-full py-2 rounded bg-orange-600 text-black font-medium hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}