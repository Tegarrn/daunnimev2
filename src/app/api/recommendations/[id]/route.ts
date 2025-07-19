import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const animeIdToExclude = parseInt(id, 10);

  if (isNaN(animeIdToExclude)) {
    return new NextResponse(JSON.stringify({ error: 'ID Anime tidak valid' }), { status: 400 });
  }

  try {
    // 1. Ambil genre dari anime yang sedang dilihat
    const { data: currentAnime, error: currentAnimeError } = await supabase
      .from('anime')
      .select('genres')
      .eq('id', animeIdToExclude)
      .single();

    if (currentAnimeError || !currentAnime) {
      throw new Error('Anime tidak ditemukan');
    }

    const targetGenres = currentAnime.genres;

    // 2. Cari anime lain yang memiliki salah satu genre yang sama
    const { data: recommendedAnime, error: recommendError } = await supabase
      .from('anime')
      .select('*')
      .overlaps('genres', targetGenres) // Mencari anime yang genrenya beririsan
      .neq('id', animeIdToExclude)      // Mengecualikan anime yang sedang dilihat
      .limit(10); // Ambil 10 untuk diacak

    if (recommendError) {
      throw new Error(recommendError.message);
    }
    
    // Acak hasilnya dan ambil 6 teratas untuk variasi
    const shuffled = recommendedAnime.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 6);

    return NextResponse.json({ data: recommendations });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil rekomendasi', details: error.message }),
      { status: 500 }
    );
  }
}
