import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const revalidate = 3600; // Cache this route handler for 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const account = searchParams.get('account') || 'wanderingkite';

  let token = process.env.INSTAGRAM_ACCESS_TOKEN_WANDERINGKITE;
  if (account === 'studio') {
    token = process.env.INSTAGRAM_ACCESS_TOKEN_STUDIO || process.env.INSTAGRAM_ACCESS_TOKEN_WANDERINGKITE;
  }

  if (!token) {
    logger.warn(`Warning: Instagram access token for account "${account}" is not configured in .env.local.`);
    return NextResponse.json(
      { success: false, error: `Instagram access token for account "${account}" is not configured.` },
      { status: 200 }
    );
  }

  try {
    // Fetch a larger limit (e.g. 50 items) so we can thoroughly filter for reels/videos
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&limit=50&access_token=${token}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache the fetch request as well
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.warn('Instagram API returned an error (handled gracefully):', response.status, errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media from Instagram API.', details: errorData },
        { status: 200 }
      );
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      logger.warn('Unexpected Instagram API response structure (handled gracefully):', data);
      return NextResponse.json(
        { success: false, error: 'Unexpected response from Instagram API.' },
        { status: 200 }
      );
    }

    const items = data.data;

    // Filter items: prioritize VIDEO/REEL types
    const videos = items.filter((item: any) => item.media_type === 'VIDEO');
    const images = items.filter(
      (item: any) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM'
    );

    // Combine them, prioritizing videos, and falling back to images if we have < 5 videos
    let selected = [...videos];
    if (selected.length < 5) {
      selected = [...selected, ...images];
    }

    // Keep only the first 5 elements
    const result = selected.slice(0, 5);

    // Format the items cleanly for our client component
    const formattedResult = result.map((item: any) => ({
      id: item.id,
      media_type: item.media_type,
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url || item.media_url, // fallback if thumbnail_url is missing
      permalink: item.permalink,
    }));

    return NextResponse.json({
      success: true,
      data: formattedResult,
    });
  } catch (err: any) {
    logger.warn('Exception in Instagram route handler (handled gracefully):', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching Instagram feed.', details: err.message },
      { status: 200 }
    );
  }
}
