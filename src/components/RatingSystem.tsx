'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rating } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface RatingSystemProps {
  animeId: number;
  // Prop baru untuk mengirim data ke parent component
  onAverageScoreUpdate: (score: number | null) => void;
}

export default function RatingSystem({ animeId, onAverageScoreUpdate }: RatingSystemProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  // Hapus state averageScore dari sini karena akan dikelola oleh parent
  const [userScore, setUserScore] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    async function fetchRatings() {
      try {
        const res = await fetch(`/api/ratings?anime_id=${animeId}`);
        const { data, averageScore } = await res.json();
        setRatings(data || []);
        // Kirim skor rata-rata ke parent component saat data diterima
        onAverageScoreUpdate(averageScore);
      } catch (error) {
        console.error("Failed to fetch ratings", error);
        onAverageScoreUpdate(null); // Kirim null jika gagal
      } finally {
        setLoading(false);
      }
    }
    fetchRatings();
  }, [animeId, onAverageScoreUpdate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (userScore === 0 || !isLoggedIn) return;

    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        setIsSubmitting(false);
        return;
    };

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          anime_id: animeId,
          score: userScore,
          review: userReview,
        }),
      });

      if (res.ok) {
        const newRes = await fetch(`/api/ratings?anime_id=${animeId}`);
        const { data, averageScore } = await newRes.json();
        setRatings(data || []);
        // Perbarui skor rata-rata di parent component setelah submit
        onAverageScoreUpdate(averageScore);
        alert('Ulasan Anda berhasil dikirim!');
      }
    } catch (error) {
      console.error("Failed to post review", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Peringkat & Ulasan</h2>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border border-gray-700 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Berikan Ulasan Anda</h3>
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                onClick={() => setUserScore(star)}
                className={`w-8 h-8 cursor-pointer ${userScore >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
              </svg>
            ))}
          </div>
          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tulis ulasan singkat Anda (opsional)..."
            rows={3}
          ></textarea>
          <button type="submit" className="mt-3 px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500" disabled={userScore === 0 || isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 mb-6">Anda harus login untuk memberikan ulasan.</p>
      )}

      <div className="space-y-4">
        {loading ? <p>Memuat ulasan...</p> : ratings.map(rating => (
          <div key={rating.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="relative w-8 h-8 rounded-full bg-gray-600 mr-3 overflow-hidden">
                {rating.profiles.avatar_url && (
                  <Image src={rating.profiles.avatar_url} alt="Avatar" fill sizes="32px" className="object-cover" />
                )}
              </div>
              <Link href={`/users/${rating.profiles.id}`} className="font-bold text-white hover:text-indigo-400">
                {rating.profiles.username}
              </Link>
              <span className="text-xs text-gray-500 ml-auto">{new Date(rating.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} className={`w-5 h-5 ${rating.score >= star ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.176 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>
            {rating.review && <p className="text-gray-300">{rating.review}</p>}
          </div>
        ))}
        {!loading && ratings.length === 0 && <p className="text-gray-400">Belum ada ulasan untuk anime ini.</p>}
      </div>
    </div>
  );
}