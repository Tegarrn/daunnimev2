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
    const { data: currentAnime, error: currentAnimeError } = await supabase
      .from('anime')
      .select('genres')
      .eq('id', animeIdToExclude)
      .single();

    if (currentAnimeError || !currentAnime) {
      throw new Error('Anime tidak ditemukan');
    }

    const targetGenres = currentAnime.genres;

    const { data: recommendedAnime, error: recommendError } = await supabase
      .from('anime')
      .select('*')
      .overlaps('genres', targetGenres)
      .neq('id', animeIdToExclude)
      .limit(10);

    if (recommendError) {
      throw new Error(recommendError.message);
    }
    
    const shuffled = recommendedAnime.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 6);

    return NextResponse.json({ data: recommendations });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil rekomendasi', details: errorMessage }),
      { status: 500 }
    );
  }
}