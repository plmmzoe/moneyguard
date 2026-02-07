import { getProfile } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import Profile from '@/components/profile/profile';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const profile = await getProfile();

  // fetch auth user email server-side to avoid exposing `user_id`
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data?.user?.email ?? null;

  return (
    <AppLayout>
      <Profile profile={profile} email={email} />
    </AppLayout>
  );
}
