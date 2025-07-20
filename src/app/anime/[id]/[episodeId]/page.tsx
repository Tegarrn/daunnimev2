'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/lib/supabaseClient';
import { Anime } from '@/types';

interface Episode {
  id: number;
  episode_number: string;
  gdrive_file_id_720p: string;
}

interface AnimeDetail extends Anime {
  episodes: Episode[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const animeId = params.id as string;
  const episodeId = parseInt(params.episodeId as string, 10);

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Mengambil data anime
  useEffect(() => {
    if (!animeId) return;

    async function fetchAnimeData() {
      try {
        const res = await fetch(`/api/anime/${animeId}`);
        if (!res.ok) {
          notFound();
          return;
        }
        const { data } = await res.json();
        setAnime(data);
      } catch (error) {
        console.error("Error fetching anime data:", error);
        setAnime(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimeData();
  }, [animeId]);

  // Mencari episode yang sedang ditonton dan episode selanjutnya/sebelumnya
  const { currentEpisode, nextEpisode, prevEpisode } = useMemo(() => {
    if (!anime) return { currentEpisode: null, nextEpisode: null, prevEpisode: null };

    // Urutkan episode berdasarkan nomor untuk memastikan urutan yang benar
    const sortedEpisodes = [...anime.episodes].sort((a, b) => 
      a.episode_number.localeCompare(b.episode_number, undefined, { numeric: true })
    );

    const currentIndex = sortedEpisodes.findIndex(ep => ep.id === episodeId);
    if (currentIndex === -1) return { currentEpisode: null, nextEpisode: null, prevEpisode: null };

    return {
      currentEpisode: sortedEpisodes[currentIndex],
      nextEpisode: sortedEpisodes[currentIndex + 1] || null,
      prevEpisode: sortedEpisodes[currentIndex - 1] || null,
    };
  }, [anime, episodeId]);

  // Mengirim riwayat tontonan
  useEffect(() => {
    if (!currentEpisode) return;

    const sendWatchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await fetch('/api/watch-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ episode_id: currentEpisode.id }),
        });
      } catch (error) {
        console.error("Failed to send watch history:", error);
      }
    };
    sendWatchHistory();
  }, [currentEpisode]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading player...</div>;
  }

  if (!anime || !currentEpisode) {
    notFound();
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <header className="p-4 bg-gray-900/50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold truncate">{anime.title}</h1>
          <p className="text-sm text-gray-400">Episode {currentEpisode.episode_number}</p>
        </div>
        <Link href={`/anime/${animeId}`} className="px-3 py-1 text-sm bg-gray-700 rounded-md hover:bg-gray-600">
          Kembali ke Detail
        </Link>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl aspect-video">
          <VideoPlayer gdriveFileId={currentEpisode.gdrive_file_id_720p} />
        </div>
      </main>

      <footer className="p-4 bg-gray-900/50 flex justify-center items-center gap-4">
        {prevEpisode ? (
          <Link href={`/anime/${animeId}/${prevEpisode.id}`} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">
            &larr; Episode Sebelumnya
          </Link>
        ) : (
          <button className="px-4 py-2 bg-gray-700 rounded-md cursor-not-allowed opacity-50" disabled>&larr; Episode Sebelumnya</button>
        )}
        {nextEpisode ? (
          <Link href={`/anime/${animeId}/${nextEpisode.id}`} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">
            Episode Selanjutnya &rarr;
          </Link>
        ) : (
          <button className="px-4 py-2 bg-gray-700 rounded-md cursor-not-allowed opacity-50" disabled>Episode Selanjutnya &rarr;</button>
        )}
      </footer>
    </div>
  );
}