import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Initialize Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS
  );

  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // NEW V1 Endpoint
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const googleRes = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        // CRITICAL: These must match the V1 spec exactly
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount,displayName',
      },
    });

    const data = await googleRes.json();

    // Check if we actually got reviews
    if (!data.reviews || data.reviews.length === 0) {
      console.log('Google Data Received:', data); // Check your terminal logs
      return NextResponse.json({
        message: 'No reviews found from Google',
        debug: data,
      });
    }

    // 2. Map Google V1 fields to your Supabase schema
    const reviewsToSync = data.reviews.map((rev: any) => ({
      id: rev.name, // Format: "places/PLACE_ID/reviews/REVIEW_ID"
      author_name: rev.authorAttribution?.displayName || 'Anonymous',
      rating: rev.rating,
      text: rev.text?.text || '',
      // Convert ISO string to Unix timestamp for easy sorting
      time: rev.publishTime
        ? Math.floor(new Date(rev.publishTime).getTime() / 1000)
        : 0,
      profile_photo_url: rev.authorAttribution?.photoUri || null,
      relative_time: rev.relativePublishTimeDescription || '',
      service_tag: 'general',
      synced_at: new Date().toISOString(),
    }));

    // 3. Upsert into Supabase
    const { error } = await supabase
      .from('reviews')
      .upsert(reviewsToSync, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: reviewsToSync.length,
      business: data.displayName?.text,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
