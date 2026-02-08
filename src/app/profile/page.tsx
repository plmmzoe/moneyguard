import Link from 'next/link';

import { getProfile } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import Profile from '@/components/profile/profile';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (!user) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto rounded-xl bg-card border border-border p-4 sm:p-6 md:p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      </AppLayout>
    );
  }

  const profile = await getProfile();
  const email = user.email ?? null;

  return (
    <AppLayout>
      <Profile profile={profile} email={email} />
    </AppLayout>
  );
}
