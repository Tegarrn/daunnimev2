import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get an authenticated Supabase client
async function getSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized', client: null };
  }
  const token = authHeader.split(' ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { user: null, error: 'Invalid token', client: null };
  }

  return { user, error: null, client: supabase };
}

// --- GET: Fetch all ratings for a specific anime ---
export async function GET(request: NextRequest) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { searchParams } = new URL(request.url);
    const anime_id = searchParams.get('anime_id');

    if (!anime_id) {
        return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('ratings')
            .select('*, profiles(id, username, avatar_url)')
            .eq('anime_id', anime_id)
            .order('created_at', { ascending: false });

        if (error) {
          console.error('[RATINGS GET ERROR]', error);
          throw error;
        }

        const averageScore = data.length > 0
            ? data.reduce((acc, curr) => acc + curr.score, 0) / data.length
            : 0;

        return NextResponse.json({ data, averageScore: parseFloat(averageScore.toFixed(1)) });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch ratings', details: errorMessage }), { status: 500 });
    }
}

// --- POST: Add or update a rating and review ---
export async function POST(request: NextRequest) {
  const { anime_id, score, review } = await request.json();
  const { user, error: authError, client } = await getSupabaseClient(request);

  if (authError || !user || !client) {
    return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
  }

  if (!anime_id || !score) {
    return new NextResponse(JSON.stringify({ error: 'anime_id and score are required' }), { status: 400 });
  }

  try {
    const { data, error } = await client
      .from('ratings')
      .upsert({ user_id: user.id, anime_id, score, review: review || null })
      .select()
      .single();

    if (error) {
      console.error('[RATINGS POST ERROR]', error);
      throw error;
    }
    
    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to submit rating', details: errorMessage }), { status: 500 });
  }
}