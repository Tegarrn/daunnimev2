import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("--- POST /api/comments CALLED ---");
  const { anime_id, content } = await request.json();
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Token is invalid or expired.');
    return new NextResponse(JSON.stringify({ error: 'Unauthorized: Invalid token.' }), { status: 401 });
  }

  console.log(`Token is VALID. User ID: ${user.id}. Proceeding...`);
  const user_id = user.id;
  const XP_PER_COMMENT = 5;

  try {
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({ anime_id, content, user_id })
      .select('*, profiles(id, username, avatar_url)')
      .single();

    if (insertError) throw insertError;

    await supabase.rpc('add_xp', {
      user_id_input: user_id,
      xp_amount: XP_PER_COMMENT,
    });
    
    return NextResponse.json({ data });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[POST /api/comments ERROR]', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to post comment', details: errorMessage }), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { searchParams } = new URL(request.url);
    const anime_id = searchParams.get('anime_id');

    if (!anime_id) {
        return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(id, username, avatar_url)')
            .eq('anime_id', anime_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ data });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('[GET /api/comments ERROR]', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch comments', details: errorMessage }), { status: 500 });
    }
}