// src/app/api/anime/latest/route.ts

import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache selama 1 jam

export async function GET() {
  try {
    // Mengambil 12 anime terbaru berdasarkan kolom created_at
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

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil data anime terbaru', details: error.message }),
      { status: 500 }
    );
  }
}