import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

/**
 * Hook to fetch shoots and their associated gallery images from Supabase.
 * It also sets up a real‑time subscription to keep the frontend in sync
 * when new shoots are added via the Supabase dashboard.
 */
export function useShoots() {
  const supabase = createClient();
  // In the Database type, gallery_images isn't physically on the Row type,
  // but Supabase returns it via join when requested.
  // We'll augment the type locally for the hook state.
  type ShootWithImages = Database['public']['Tables']['shoots']['Row'] & {
    gallery_images?: Database['public']['Tables']['gallery_images']['Row'][];
  };

  const [shoots, setShoots] = useState<ShootWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShoots() {
      setLoading(true);
      const { data, error } = await supabase
        .from('shoots')
        .select('*, gallery_images(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Flatten images into each shoot record
      setShoots(data as any);
      setLoading(false);
    }

    fetchShoots();

    // Real‑time subscription for INSERT updates
    const subscription = supabase
      .channel('public:shoots')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shoots',
        },
        (payload) => {
          // Append new shoot to state
          setShoots((prev) => [payload.new as any, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  return { shoots, loading, error };
}
