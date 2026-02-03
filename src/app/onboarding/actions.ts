'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

export async function createOrUpdateProfile(data: {
  username: string;
  monthlyBudget: number;
  currency: string;
  monthlyIrregularSpending: number;
  savingsGoalAmount: number;
  savingsGoalReward: string;
  savingsGoalTargetDate: string;
  hobbies?: { name: string; rating: number }[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username,
        monthly_budget: data.monthlyBudget,
        currency: data.currency,
        monthly_irregular_spending: data.monthlyIrregularSpending,
        savings_goal_amount: data.savingsGoalAmount,
        savings_goal_reward: data.savingsGoalReward,
        savings_goal_target_date: new Date(data.savingsGoalTargetDate).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  } else {
    // Create new profile
    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      username: data.username,
      monthly_budget: data.monthlyBudget,
      currency: data.currency,
      monthly_irregular_spending: data.monthlyIrregularSpending,
      savings_goal_amount: data.savingsGoalAmount,
      savings_goal_reward: data.savingsGoalReward,
      savings_goal_target_date: new Date(data.savingsGoalTargetDate).toISOString(),
    });

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  }

  revalidatePath('/onboarding');
  revalidatePath('/profile');
  revalidatePath('/dashboard');
}

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows found" error
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.user_id,
    username: profile.username,
    monthlyBudget: profile.monthly_budget,
    currency: profile.currency,
    monthlyIrregularSpending: profile.monthly_irregular_spending,
    savingsGoalAmount: profile.savings_goal_amount,
    savingsGoalReward: profile.savings_goal_reward,
    savingsGoalTargetDate: profile.savings_goal_target_date,
    hobbies: profile.hobbies as { name: string; rating: number }[] | null,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  return !data; // Available if no data found
}
