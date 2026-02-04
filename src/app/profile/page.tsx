'use client';

import { AppLayout } from '@/components/app-layout';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <AppLayout>
      <div className="rounded-xl bg-card border border-border p-6 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        {user ? (
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 text-foreground">{user.email ?? '—'}</dd>
            </div>
            {user.user_metadata?.full_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-foreground">{user.user_metadata.full_name}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-muted-foreground">Sign in to view your account details.</p>
        )}
      </div>
    </AppLayout>
  );
}
