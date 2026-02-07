import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { getProfile } from '@/app/dashboard/actions';
import { Profile } from '@/lib/dashboard.type';

export function useProfileInfo(supabase: SupabaseClient | null) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!supabase) {return;}
    (async () => {
      const data = await getProfile();
      if (data) {
        setProfile(data);
      }
    })();
  }, [supabase]);

  return { profile };
}
