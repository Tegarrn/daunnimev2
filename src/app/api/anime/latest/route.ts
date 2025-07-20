import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Supabase error:', error.message);
      throw new Error(error.message);
    }

    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil data anime terbaru', details: errorMessage }),
      { status: 500 }
    );
  }
}