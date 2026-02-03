'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { useToast } from '@/components/ui/use-toast';

import { createOrUpdateProfile } from './actions';

interface OnboardingPageProps {
  initialProfile?: {
    username: string;
    monthlyBudget: number;
    currency: string;
    monthlyIrregularSpending: number | null | undefined;
    savingsGoalAmount: number | null | undefined;
    savingsGoalReward: string | null | undefined;
    savingsGoalTargetDate: string | null | undefined;
    hobbies: { name: string; rating: number }[] | null | undefined;
  };
  isUpdate?: boolean;
}

export function OnboardingPageContent({ initialProfile, isUpdate }: OnboardingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: {
    username: string;
    monthlyBudget: number;
    currency: string;
    monthlyIrregularSpending: number;
    savingsGoalAmount: number;
    savingsGoalReward: string;
    savingsGoalTargetDate: string;
    hobbies: { name: string; rating: number }[];
  }) => {
    setIsLoading(true);
    try {
      await createOrUpdateProfile(data);

      const message = isUpdate ? 'Profile updated successfully!' : 'Profile created successfully!';
      toast({
        title: 'Success',
        description: message,
      });

      // Redirect to dashboard or appropriate page
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isUpdate ? 'Update Your Profile' : 'Welcome to MoneyGuard'}
          </h1>
          <p className="text-muted-foreground">
            {isUpdate
              ? 'Update your profile information and savings goals'
              : 'Let\'s set up your financial profile and savings goals'}
          </p>
        </div>

        <OnboardingForm
          initialData={initialProfile}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
