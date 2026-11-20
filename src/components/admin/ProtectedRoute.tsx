import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export function ProtectedRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center">Checking session...</div>;
  return session ? <Outlet /> : <Navigate to="/admin/login" replace />;
}