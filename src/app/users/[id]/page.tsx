'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AnimeCard from '@/components/AnimeCard';
import { Anime, UserAnimeListItem } from '@/types';

// Tipe data untuk profil pengguna
interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  avatar_url: string | null;
  member_id: number;
}

// Tipe data untuk riwayat tontonan
interface WatchHistoryItem {
  id: number;
  watched_at: string;
  episodes: {
    episode_number: string;
    anime: { id: number; title: string; thumbnail_gdrive_id: string; }
  }
}

type WatchlistStatus = 'watching' | 'completed' | 'planned' | 'dropped';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<UserAnimeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [activeTab, setActiveTab] = useState<WatchlistStatus | 'all'>('all');

  useEffect(() => {
    async function getPublicProfileData() {
      if (!userId) {
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.id === userId) {
            setIsOwnProfile(true);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error saat mengambil profil:", profileError.message);
          setLoading(false);
          notFound();
          return;
        }
        setProfile(profileData);
        
        const [historyRes, watchlistRes] = await Promise.all([
            supabase
              .from('watch_history')
              .select('id, watched_at, episodes!inner(episode_number, anime!inner(id, title, thumbnail_gdrive_id))')
              .eq('user_id', userId)
              .order('watched_at', { ascending: false })
              .limit(10),
            supabase
              .from('user_anime_list')
              .select('id, created_at, status, anime!inner(*)')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
        ]);

        if (historyRes.error) console.error('Error mengambil riwayat:', historyRes.error.message);
        else setHistory(historyRes.data as unknown as WatchHistoryItem[]);

        if (watchlistRes.error) console.error('Error mengambil daftar tontonan:', watchlistRes.error.message);
        else setWatchlist(watchlistRes.data as unknown as UserAnimeListItem[]);

      } catch (error) {
        console.error("Terjadi error tak terduga:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    
    getPublicProfileData();
  }, [userId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAvatarFile(event.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !profile) return;
    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
      setAvatarFile(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const filteredWatchlist = watchlist.filter(item => activeTab === 'all' || item.status === activeTab);

  if (loading) {
    return <div className="text-center text-white py-20">Loading...</div>;
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-indigo-500">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="User Avatar" fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">No Avatar</div>
                )}
              </div>
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <p className="text-sm text-gray-400 mt-1">Anggota #{profile.member_id}</p>
              
              <div className="mt-4 text-lg">
                <span className="font-semibold text-indigo-400">Level:</span> {profile.level}
              </div>
              <div className="mt-2 text-lg">
                <span className="font-semibold text-green-400">XP:</span> {profile.xp}
              </div>
              
              {isOwnProfile && (
                <>
                  <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold mb-2">Ganti Avatar</h3>
                    <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    {avatarFile && (
                      <button onClick={handleAvatarUpload} disabled={uploading} className="mt-4 w-full px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500">
                        {uploading ? 'Mengunggah...' : 'Upload Avatar'}
                      </button>
                    )}
                  </div>
                  <button onClick={handleLogout} className="mt-8 w-full px-4 py-2 bg-red-600 rounded-md hover:bg-red-700">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6">Riwayat Tontonan Terakhir</h2>
          <div className="space-y-4">
            {history.length > 0 ? history.map(item => (
              <Link key={item.id} href={`/anime/${item.episodes.anime.id}`} className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="relative w-16 h-24 mr-4 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={`/api/image-proxy/${item.episodes.anime.thumbnail_gdrive_id}`} alt="Thumbnail" fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.episodes.anime.title}</h3>
                  <p className="text-gray-400">Episode {item.episodes.episode_number}</p>
                  <p className="text-xs text-gray-500 mt-1">Ditononton pada: {new Date(item.watched_at).toLocaleString()}</p>
                </div>
              </Link>
            )) : (
              <p className="text-gray-400">Pengguna ini belum menonton apa pun.</p>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Daftar Tontonan</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setActiveTab('all')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'all' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Semua</button>
                <button onClick={() => setActiveTab('watching')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'watching' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Menonton</button>
                <button onClick={() => setActiveTab('completed')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'completed' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Selesai</button>
                <button onClick={() => setActiveTab('planned')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'planned' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Direncanakan</button>
                <button onClick={() => setActiveTab('dropped')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'dropped' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Ditinggalkan</button>
            </div>
            {filteredWatchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                {filteredWatchlist.map(item => (
                  <AnimeCard key={`watchlist-${item.id}`} anime={item.anime} />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-center">Tidak ada anime dalam kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}