'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

interface Profile {
  role?: string;
}

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const fetchSessionAndProfile = async (currentSession: Session | null) => {
      setSession(currentSession);
      if (currentSession) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchSessionAndProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchSessionAndProfile(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
    }
  };

  const navLoading = (
    <nav className="bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">PustakaAnime</Link>
      </div>
    </nav>
  );

  if (loading) return navLoading;

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white text-xl font-bold">PustakaAnime</Link>
          <Link href="/anime" className="text-gray-300 hover:text-white text-sm">Daftar Anime</Link>
          {session && profile?.role === 'admin' && (
            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">Dasbor Admin</Link>
          )}
        </div>
        
        <div className="flex items-center gap-4 flex-grow max-w-xs">
           <form onSubmit={handleSearch} className="w-full">
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul anime..."
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>

        <div>
          {session ? (
            <Link href={`/users/${session.user.id}`} className="text-white hover:text-indigo-400 text-sm font-medium">Profil</Link>
          ) : (
            <Link href="/auth/login" className="text-white hover:text-indigo-400 text-sm font-medium">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}