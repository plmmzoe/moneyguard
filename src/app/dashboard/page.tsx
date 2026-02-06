import { getAnalyses, getProfile, getSavedTowardsGoal } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import { DashboardPage } from '@/components/dashboard/dashboard-page';

export default async function Dashboard() {
  const [profile, analyses, savedTowardsGoal] = await Promise.all([
    getProfile(),
    getAnalyses(),
    getSavedTowardsGoal(),
  ]);
  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;

  return (
    <AppLayout>
      <DashboardPage
        profile={profile}
        latestAnalysis={latestAnalysis}
        savedTowardsGoal={savedTowardsGoal}
      />
    </AppLayout>
  );
}
