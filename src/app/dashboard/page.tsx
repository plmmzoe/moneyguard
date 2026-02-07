import { getCoolOffs, getProfile, getTotalSaved, getTransactionPeriod } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { Tables } from '@/lib/database.types';

export default async function Dashboard() {
  const [profile, cooloffs, savedTowardsGoal, monthlySpending] = await Promise.all([
    getProfile(),
    getCoolOffs(),
    getTotalSaved(),
    getTransactionPeriod(30),
  ]);

  return (
    <AppLayout>
      <DashboardPage
        profile={profile}
        coolOffs={cooloffs}
        saving={profile?.savings}
        savedTowardsGoal={savedTowardsGoal}
        monthlySpending={monthlySpending.reduce((accumulator:number, t:Tables<'transactions'>) => {
          return accumulator + t.amount;
        }, 0)}
      />
    </AppLayout>
  );
}
