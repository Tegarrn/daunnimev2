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

  // Membuat URL download langsung dari Google Drive
  const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${gdriveId}`;

  try {
    // Langsung fetch gambar dari URL download tersebut
    const imageResponse = await fetch(directDownloadUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('Content-Type');

    // Pastikan konten yang diterima adalah gambar
    if (!contentType || !contentType.startsWith('image/')) {
        // Jika bukan gambar, file aslinya mungkin rusak atau bukan gambar
        throw new Error('The fetched file is not a valid image.');
    }

    // Kirim kembali data gambar dengan header yang benar
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });

  } catch (error: any) {
    console.error(`[IMAGE PROXY ERROR for ID ${gdriveId}]:`, error.message);
    // Jika ada error, kembalikan response error agar mudah di-debug
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}