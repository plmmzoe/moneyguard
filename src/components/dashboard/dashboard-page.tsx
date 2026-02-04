'use client';

import { Profile } from '@/components/dashboard/profile';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

export function DashboardPage() {
  const supabase = createClient();
  useUserInfo(supabase);

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <Profile supabase={supabase} />
    </div>
  );
}
