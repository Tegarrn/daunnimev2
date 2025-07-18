// src/app/api/anime/search/route.ts

import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return new NextResponse(
      JSON.stringify({ error: 'Query pencarian "q" dibutuhkan' }),
      { status: 400 }
    );
  }

  try {
    // Mencari anime yang judulnya cocok (case-insensitive) dengan query
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Gagal melakukan pencarian', details: error.message }),
      { status: 500 }
    );
  }
}