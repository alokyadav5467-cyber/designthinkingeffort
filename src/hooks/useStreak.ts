import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserStreak } from '../types';

export function useStreak(userId?: string) {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;

      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      setStreak(data);
      setLoading(false);
    };

    fetchStreak();
  }, [userId]);

  return { streak, loading };
}
