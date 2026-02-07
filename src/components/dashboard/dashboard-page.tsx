'use client';

import { StatsBanner } from '@/components/dashboard/widgets/stats-banner';
import { TransactionGoal } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

import { CoolOffStatusCard } from './widgets/cool-off-status-card';
import { DecisionReadinessBanner } from './widgets/decision-readiness-banner';
import { GoalAnchor } from './widgets/goal-anchor';
import { QuickIntentCheckIn } from './widgets/quick-intent-check-in';

interface Props {
  profile: Tables<'profiles'> | null;
  coolOffs: TransactionGoal[] | [];
  saving: Tables<'savings'> | null | undefined;
  savedTowardsGoal: number;
}

export function DashboardPage({ profile, coolOffs, saving, savedTowardsGoal }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <DecisionReadinessBanner mindset={profile?.spending_mindset ?? null} />
      <div className="rounded-xl bg-card border border-border p-6 space-y-8">
        <QuickIntentCheckIn />
        <StatsBanner totalSpending={savedTowardsGoal} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoolOffStatusCard transactions={coolOffs} />
          <GoalAnchor profile={profile} saving={saving} />
        </div>
      </div>
    </div>
  );
}
