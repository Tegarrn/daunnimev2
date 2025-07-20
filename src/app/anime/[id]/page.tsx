'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Anime } from '@/types';
import { notFound, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CommentSection from '@/components/CommentSection';
import Recommendations from '@/components/Recommendations';
import RatingSystem from '@/components/RatingSystem';

interface Episode {
  id: number;
  episode_number: string;
  gdrive_file_id_720p: string;
}

interface AnimeDetail extends Anime {
  episodes: Episode[];
}

export default function AnimeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [averageUserScore, setAverageUserScore] = useState<number | null>(null);
  const [displayedRatingType, setDisplayedRatingType] = useState<'default' | 'user'>('default');

  useEffect(() => {
    async function fetchAndSetData() {
      if (!id) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/anime/${id}`);
        if (!res.ok) {
          notFound();
          return;
        }
        const { data } = await res.json();
        setAnime(data);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          const bookmarkRes = await fetch(`/api/bookmarks?anime_id=${id}`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          });
          if (bookmarkRes.ok) {
            const { isBookmarked } = await bookmarkRes.json();
            setIsBookmarked(isBookmarked);
          }
        } else {
          setIsLoggedIn(false);
        }

      } catch (error) {
        console.error("Error fetching anime detail:", error);
      } finally {
        setLoading(false);
        setIsBookmarkLoading(false);
      }
    }
    
    fetchAndSetData();
  }, [id]);

  const handleAverageScoreUpdate = useCallback((score: number | null) => {
    setAverageUserScore(score);
  }, []);

  const handleToggleBookmark = async () => {
    if (!anime) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Anda harus login untuk menambahkan bookmark.');
      return;
    }

    setIsBookmarkLoading(true);
    const method = isBookmarked ? 'DELETE' : 'POST';
    try {
      const res = await fetch('/api/bookmarks', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ anime_id: anime.id }),
      });

      if (res.ok) setIsBookmarked(!isBookmarked);
      else console.error("Gagal mengubah status bookmark");

    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-white py-20">Loading...</div>;
  }

  if (!anime) {
    notFound();
  }
  
  const imageUrl = `/api/image-proxy/${anime.thumbnail_gdrive_id}`;

  const ratingToShow = displayedRatingType === 'user' && averageUserScore 
    ? averageUserScore.toFixed(1) 
    : anime.rating_score.toFixed(1);
  const ratingLabel = displayedRatingType === 'user' ? 'Rating Pengguna' : 'Rating Bawaan';

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Placeholder sudah dihapus dari sini */}
      <div className="flex flex-col md:flex-row gap-8 mb-8"> {/* Menambahkan margin bottom di sini */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="aspect-[2/3] w-full bg-gray-700 rounded-lg overflow-hidden relative">
            <img 
              src={imageUrl} 
              alt={`Thumbnail for ${anime.title}`} 
              className="object-cover object-center w-full h-full"
            />
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
          
          <div className="flex items-center gap-4 mb-4">
              {isLoggedIn && (
                  <button
                      onClick={handleToggleBookmark}
                      disabled={isBookmarkLoading}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
                          isBookmarked
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                      </svg>
                      {isBookmarkLoading ? 'Memuat...' : (isBookmarked ? 'Hapus Bookmark' : 'Tambah Bookmark')}
                  </button>
              )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-4">
            <span>{anime.anime_type}</span>
            <span>&bull;</span>
            <span>{anime.status}</span>
            <span>&bull;</span>
            <div className="flex items-center gap-2">
                <span>{ratingLabel}: {ratingToShow}</span>
                {averageUserScore !== null && (
                    <button 
                        onClick={() => setDisplayedRatingType(prev => prev === 'default' ? 'user' : 'default')}
                        className="p-1 text-xs bg-gray-700 rounded-md hover:bg-gray-600"
                        title="Ganti Tampilan Rating"
                    >
                        🔄
                    </button>
                )}
            </div>
            {anime.info?.studio && (
              <>
                <span>&bull;</span>
                <span>Studio: {anime.info.studio}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres.map((genre) => (
              <span key={genre} className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                {genre}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-2 border-b-2 border-gray-700 pb-1">Sinopsis</h2>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {anime.synopsis}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Daftar Episode</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {anime.episodes
            .sort((a, b) => a.episode_number.localeCompare(b.episode_number, undefined, { numeric: true }))
            .map((ep) => (
            <Link 
              key={ep.id} 
              href={`/anime/${anime.id}/${ep.id}`}
              className="text-center p-3 rounded-md border transition-colors w-full bg-gray-800 border-gray-700 hover:bg-indigo-600 hover:border-indigo-500"
            >
              Eps {ep.episode_number}
            </Link>
          ))}
        </div>
      </div>
      
      <RatingSystem animeId={anime.id} onAverageScoreUpdate={handleAverageScoreUpdate} />
      <CommentSection animeId={anime.id} />
      <Recommendations animeId={anime.id} />
    </div>
  );
}