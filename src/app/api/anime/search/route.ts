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
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Gagal melakukan pencarian', details: errorMessage }),
      { status: 500 }
    );
  }
}