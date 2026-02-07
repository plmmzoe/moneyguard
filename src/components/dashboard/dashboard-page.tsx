'use client';

import { Tables } from '@/lib/database.types';

import { CoolOffStatusCard } from './widgets/cool-off-status-card';
import { DecisionReadinessBanner } from './widgets/decision-readiness-banner';
import { GoalAnchor } from './widgets/goal-anchor';
import { InlineQuickCheckTrigger } from './widgets/inline-quick-check-trigger';
import { QuickIntentCheckIn } from './widgets/quick-intent-check-in';

interface Props {
  profile: Tables<'profiles'> | null;
  latestAnalysis: Tables<'transactions'> | null;
  activeGoal: Tables<'savings'> | null;
  savedTowardsGoal: number;
}

export function DashboardPage({ profile, latestAnalysis, activeGoal, savedTowardsGoal }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <DecisionReadinessBanner mindset={null} />
      <div className="rounded-xl bg-card border border-border p-6 space-y-8">
        <QuickIntentCheckIn />
        <InlineQuickCheckTrigger />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoolOffStatusCard latestAnalysis={latestAnalysis} />
          <GoalAnchor profile={profile} activeGoal={activeGoal} savedTowardsGoal={savedTowardsGoal} />
        </div>
      </div>
    </div>
  );
}
