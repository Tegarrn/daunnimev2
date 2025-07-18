'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <nav className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white text-xl font-bold">
            PustakaAnime
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          PustakaAnime
        </Link>
        <div>
          {session ? (
            // --- PERUBAHAN DI SINI ---
            // Tautan sekarang dinamis ke halaman profil publik pengguna yang login
            <Link href={`/users/${session.user.id}`} className="text-white hover:text-indigo-400">
              Profil
            </Link>
          ) : (
            <Link href="/auth/login" className="text-white hover:text-indigo-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}