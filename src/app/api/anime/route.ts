import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Supabase error:', error.message);
      throw new Error(error.message);
    }

    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil data anime', details: errorMessage }),
      { status: 500 }
    );
  }
}