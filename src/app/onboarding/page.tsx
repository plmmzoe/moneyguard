import { AppLayout } from '@/components/app-layout';

import { getProfile } from './actions';
import { OnboardingPageContent } from './onboarding-page-content';

export const metadata = {
  title: 'Profile Setup - MoneyGuard',
  description: 'Set up your financial profile and savings goals',
};

export default async function OnboardingPage() {
  const profile = await getProfile();

  // If profile exists, user is updating, otherwise first-time onboarding
  const initialProfile = profile
    ? {
      username: profile.username,
      monthlyBudget: profile.monthlyBudget,
      currency: profile.currency,
      savingsGoalAmount: 0,
      savingsGoalReward: '',
      savingsGoalTargetDate: '',
      interests: profile.interests,
    }
    : undefined;

  return (
    <AppLayout>
      <OnboardingPageContent
        initialProfile={initialProfile}
        isUpdate={!!profile}
      />
    </AppLayout>
  );
}
