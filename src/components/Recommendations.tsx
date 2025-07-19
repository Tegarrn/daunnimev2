'use client';

import { useState, useEffect } from 'react';
import { Anime } from '@/types';
import AnimeCard from './AnimeCard';

interface RecommendationsProps {
  animeId: number;
}

export default function Recommendations({ animeId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state saat ID anime berubah agar tidak menampilkan rekomendasi lama
    setLoading(true);
    setRecommendations([]);

    async function fetchRecommendations() {
      try {
        const res = await fetch(`/api/anime/recommendations/${animeId}`);
        if (res.ok) {
          const { data } = await res.json();
          setRecommendations(data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil rekomendasi:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [animeId]);

  // Jangan tampilkan apa pun jika sedang loading atau tidak ada rekomendasi
  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Mungkin Anda Suka</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {recommendations.map(anime => (
          <AnimeCard key={`rec-${anime.id}`} anime={anime} />
        ))}
      </div>
    </div>
  );
}
