import Link from 'next/link';

import { getCoolOffs, getProfile, getTotalSaved, getTransactionPeriod } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Log in
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/50"
            >
              Quick Check
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

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
