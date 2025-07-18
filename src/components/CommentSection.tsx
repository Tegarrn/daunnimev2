'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image'; // <-- Impor komponen Image

// Tipe data untuk komentar
interface Comment {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  }
}

interface CommentSectionProps {
  animeId: number;
}

export default function CommentSection({ animeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Cek status login
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Ambil komentar
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?anime_id=${animeId}`);
        const { data } = await res.json();
        setComments(data || []);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [animeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || !isLoggedIn) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ anime_id: animeId, content: newComment }),
      });
      const { data: postedComment } = await res.json();

      if (postedComment) {
        setComments([postedComment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Komentar</h2>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tulis komentar Anda..."
            rows={3}
          ></textarea>
          <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500" disabled={!newComment.trim()}>
            Kirim
          </button>
        </form>
      ) : (
        <p className="text-gray-400 mb-6">Anda harus login untuk berkomentar.</p>
      )}

      <div className="space-y-4">
        {loading ? <p>Loading komentar...</p> : comments.map(comment => (
          <div key={comment.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              {/* --- BAGIAN YANG DIPERBARUI --- */}
              <div className="relative w-8 h-8 rounded-full bg-gray-600 mr-3 overflow-hidden">
                {comment.profiles.avatar_url ? (
                  <Image 
                    src={comment.profiles.avatar_url} 
                    alt="Avatar" 
                    fill 
                    sizes="32px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              {/* ----------------------------- */}
              <span className="font-bold text-white">{comment.profiles.username}</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <p className="text-gray-300">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}