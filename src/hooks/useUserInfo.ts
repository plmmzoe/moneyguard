import { SupabaseClient, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useUserInfo(supabase: SupabaseClient) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    })();
  }, [supabase.auth]);

  return { user };
}
