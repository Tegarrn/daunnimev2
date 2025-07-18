'use client';

import { useState, useEffect } from 'react';
import { Anime } from '@/types';
import { notFound, useParams } from 'next/navigation'; // Impor useParams
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/lib/supabaseClient';
import CommentSection from '@/components/CommentSection';

interface Episode {
  id: number;
  episode_number: string;
  gdrive_file_id_720p: string;
}

interface AnimeDetail extends Anime {
  episodes: Episode[];
}

export default function AnimeDetailPage() { // Hapus 'params' dari props
  const params = useParams(); // Gunakan hook useParams untuk mendapatkan parameter
  const id = params.id as string; // Ambil id dari hasil hook

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    async function fetchAnimeDetail() {
      // Gunakan 'id' yang sudah didapat dari hook
      const apiUrl = `/api/anime/${id}`;
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          setLoading(false);
          notFound();
          return;
        }
        const { data } = await res.json();
        setAnime(data);
      } catch (error) {
        console.error("Error fetching anime detail:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) { // Pastikan id sudah ada sebelum fetch
        fetchAnimeDetail();
    }
  }, [id]); // Gunakan 'id' sebagai dependency

  const handleSelectEpisode = async (episode: Episode) => {
    setSelectedEpisode(episode);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("Not logged in, cannot update watch history.");
        return;
      }

      await fetch('/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ episode_id: episode.id }),
      });
    } catch (error) {
      console.error("Failed to send watch history:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-white py-20">Loading...</div>;
  }

  if (!anime) {
    notFound();
  }
  
  const imageUrl = `/api/image-proxy/${anime.thumbnail_gdrive_id}`;

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        {selectedEpisode ? (
          <VideoPlayer gdriveFileId={selectedEpisode.gdrive_file_id_720p} />
        ) : (
          <div className="w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Pilih episode untuk mulai menonton</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="aspect-[2/3] w-full bg-gray-700 rounded-lg overflow-hidden relative">
            <img src={imageUrl} alt={`Thumbnail for ${anime.title}`} className="object-cover object-center w-full h-full" />
          </div>
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 mb-4">
            <span>{anime.anime_type}</span>
            <span>&bull;</span>
            <span>{anime.status}</span>
            <span>&bull;</span>
            <span>Rating: {anime.rating_score}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">{anime.genres.map((genre) => (<span key={genre} className="px-3 py-1 bg-gray-700 text-sm rounded-full">{genre}</span>))}</div>
          <h2 className="text-2xl font-semibold mb-2 border-b-2 border-gray-700 pb-1">Sinopsis</h2>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{anime.synopsis}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Daftar Episode</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {anime.episodes.sort((a, b) => a.episode_number.localeCompare(b.episode_number, undefined, { numeric: true })).map((ep) => (
            <button key={ep.id} onClick={() => handleSelectEpisode(ep)} className={`text-center p-3 rounded-md border transition-colors w-full ${selectedEpisode?.id === ep.id ? 'bg-indigo-600 border-indigo-500 font-bold' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
              Eps {ep.episode_number}
            </button>
          ))}
        </div>
      </div>
       <CommentSection animeId={anime.id} />
    </div>
  );
}