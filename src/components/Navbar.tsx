'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Ambil sesi yang sedang berjalan saat komponen dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Dengarkan perubahan status otentikasi (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Hentikan listener saat komponen tidak lagi digunakan
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          PustakaAnime
        </Link>
        <div>
          {session ? (
            // Jika pengguna sudah login
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-white hover:text-indigo-400">
                Profil
              </Link>
            </div>
          ) : (
            // Jika pengguna belum login
            <Link href="/auth/login" className="text-white hover:text-indigo-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}