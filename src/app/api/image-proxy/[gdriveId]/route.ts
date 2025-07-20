import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { gdriveId: string } }
) {
  const { gdriveId } = params;

  if (!gdriveId) {
    return new NextResponse(
      JSON.stringify({ error: 'Google Drive ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${gdriveId}`;

  try {
    const imageResponse = await fetch(directDownloadUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('Content-Type');

    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('The fetched file is not a valid image.');
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`[IMAGE PROXY ERROR for ID ${gdriveId}]:`, errorMessage);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}