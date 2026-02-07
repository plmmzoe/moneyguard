'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

export async function createOrUpdateProfile(data: {
  username: string;
  monthlyBudget: number;
  currency: string;
  savingsGoalAmount: number;
  savingsGoalReward: string;
  savingsGoalDescription?: string;
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
    });

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  }

  // If user provided any savings info, create a new savings goal row.
  const hasSavingsInput =
    (typeof data.savingsGoalAmount === 'number' && isFinite(data.savingsGoalAmount) && data.savingsGoalAmount > 0) ||
    (data.savingsGoalReward && data.savingsGoalReward.trim() !== '') ||
    (data.savingsGoalTargetDate && data.savingsGoalTargetDate.trim() !== '');

  if (hasSavingsInput) {
    try {
      const expireAt = data.savingsGoalTargetDate
        ? new Date(data.savingsGoalTargetDate).toISOString()
        : null;

      const { error: sError } = await supabase.from('savings').insert({
        user_id: user.id,
        goal: typeof data.savingsGoalAmount === 'number' && isFinite(data.savingsGoalAmount)
          ? data.savingsGoalAmount
          : null,
        name: data.savingsGoalReward || null,
        description: data.savingsGoalDescription ?? data.savingsGoalReward ?? null,
        expire_at: expireAt,
        amount: 0,
      });

      if (sError) {
        throw new Error(`Failed to create savings: ${sError.message}`);
      }
    } catch (err) {
      console.error('Savings insert error:', err);
      throw err;
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

  // Fetch latest savings record for the user (if any)
  const { data: savings, error: sError } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sError && sError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch savings: ${sError.message}`);
  }

  return {
    id: profile.id,
    userId: profile.user_id,
    username: profile.username,
    monthlyBudget: profile.monthly_budget,
    currency: profile.currency,
    savingsGoalAmount: savings ? savings.goal : null,
    savingsGoalReward: savings ? savings.name : null,
    savingsGoalTargetDate: savings ? savings.expire_at : null,
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
