'use client';

import { BudgetBanner } from '@/components/dashboard/widgets/monthly-budget-banner';
import { StatsBanner } from '@/components/dashboard/widgets/stats-banner';
import { Saving, TransactionGoal } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

import { CoolOffStatusCard } from './widgets/cool-off-status-card';
import { DecisionReadinessBanner } from './widgets/decision-readiness-banner';
import { GoalAnchor } from './widgets/goal-anchor';
import { QuickIntentCheckIn } from './widgets/quick-intent-check-in';

interface Props {
  profile: Tables<'profiles'> | null;
  coolOffs: TransactionGoal[] | [];
  saving: Saving | null | undefined;
  savedTowardsGoal: number;
  monthlySpending: number;
}

export function DashboardPage({ profile, coolOffs, saving, savedTowardsGoal, monthlySpending }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <DecisionReadinessBanner mindset={null} />
      <div className="rounded-xl bg-card border border-border p-6 space-y-8">
        <QuickIntentCheckIn />
        {profile?.monthly_budget && profile.currency ? (
          <BudgetBanner
            budget={profile.monthly_budget}
            currency={profile.currency}
            monthlySpending={monthlySpending}
          />
        ) : (
          <div />
        )}
        <StatsBanner totalSpending={savedTowardsGoal} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoolOffStatusCard transactions={coolOffs} />
          <GoalAnchor profile={profile} saving={saving} />
        </div>
      </div>
    </div>
  );
}
