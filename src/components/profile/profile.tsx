import Link from 'next/link';

import type { Tables } from '@/lib/database.types';

export default function Profile({
  profile,
  email,
}: {
  profile: Tables<'profiles'> | null;
  email?: string | null;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      {profile ? (
        <>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Username</dt>
              <dd className="mt-1 text-foreground">{profile.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 text-foreground">{email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
              <dd className="mt-1 text-foreground">{profile.currency ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Monthly Budget</dt>
              <dd className="mt-1 text-foreground">{profile.monthly_budget ?? '—'}</dd>
            </div>
            {profile.savings_goal_target_date && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Savings Target Date</dt>
                <dd className="mt-1 text-foreground">{new Date(profile.savings_goal_target_date).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </>
      ) : (
        <p className="text-muted-foreground">Sign in or complete your onboarding to view your profile.</p>
      )}
      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding"
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
              Edit Profile
        </Link>

        <Link
          href="/savings"
          className="inline-flex items-center px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-primary/5"
        >
              Edit Goals
        </Link>
      </div>
    </div>
  );
}
