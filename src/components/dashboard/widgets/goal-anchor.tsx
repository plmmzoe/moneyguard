'use client';

import { Anchor, Mountain, Plane } from 'lucide-react';

import { Tables } from '@/lib/database.types';

interface Props {
  profile: Tables<'profiles'> | null;
  /** Sum of amounts from history (transactions) where user chose "skipped" (decided not to buy). */
  savedTowardsGoal: number;
}

export function GoalAnchor({ profile, savedTowardsGoal }: Props) {
  const reward = profile?.savings_goal_reward || 'Trip to Japan';
  const targetRaw = profile?.savings_goal_target_date;
  const targetDate = targetRaw
    ? new Date(targetRaw).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const goalAmount = Number(profile?.savings_goal_amount ?? 0);
  const savedAmount = savedTowardsGoal;
  const hasGoalAmount = goalAmount > 0;
  const progressPercent = hasGoalAmount ? Math.min(100, (savedAmount / goalAmount) * 100) : 0;
  const currency = profile?.currency || 'USD';

  return (
    <div className="relative overflow-hidden rounded-xl shadow-sm border border-border bg-gray-900 h-full min-h-[280px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARtBbgX6xsp2LEh63KbcL_qGc0Mg2g5xq7cpuisK_bTg7g5p9P6rODhtXqSfsdBL02_bZdi-dQPx-H_T6BpAcbvZKtqOFNrTZoF9oBDmlUHZrc7-HQhvKFnADhqitWPxaWzKO2tobO5ZmbMo8UI1CiXvpWR00Ayneh3Y-mEC7FurebwPgqbfLEwrdBN5zhJf3LPpGi1p6qhFgK-uLkoTHJqVdKoTCcWy5NTrg8UYglFMnyoGCIeZcE5Hu801r4pYKDjJSFlcJcRuo')",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      <div className="relative h-full flex flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Anchor className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Your Anchor</span>
          </div>
          <Plane className="w-5 h-5 text-white/80" />
        </div>

        <div className="mt-8 md:mt-12 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
              <Mountain className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold leading-tight">{reward}</h3>
          </div>
          <p className="text-sm font-medium text-white/80">Target: {targetDate}</p>

          {hasGoalAmount ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-white/80">
                <span>Saved</span>
                <span>
                  {savedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency} / {goalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/90 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
            <p className="text-sm leading-relaxed text-gray-100">
              {hasGoalAmount
                ? `"Pausing impulse purchases today brings you closer to ${reward}."`
                : '"Set a savings goal amount in your profile to track progress."'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
