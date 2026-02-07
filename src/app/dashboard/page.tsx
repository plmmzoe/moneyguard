import { getCoolOffs, getProfile, getSavedTowardsGoal } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import { DashboardPage } from '@/components/dashboard/dashboard-page';

export default async function Dashboard() {
  const [profile, cooloffs, savedTowardsGoal] = await Promise.all([
    getProfile(),
    getCoolOffs(),
    getSavedTowardsGoal(),
  ]);

  return (
    <AppLayout>
      <DashboardPage
        profile={profile}
        coolOffs={cooloffs}
        saving={profile?.savings}
        savedTowardsGoal={savedTowardsGoal}
      />
    </AppLayout>
  );
}
