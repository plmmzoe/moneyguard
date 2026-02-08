'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

export async function createOrUpdateProfile(data: {
  username: string;
  monthlyBudget: number;
  currency: string;
  savingsGoalAmount?: number;
  savingsGoalReward?: string;
  savingsGoalDescription?: string;
  savingsGoalTargetDate?: string;
  interests?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const interests = data.interests && data.interests.length > 0 ? data.interests : null;

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
        interests,
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
      interests,
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
      const expireAt = data.savingsGoalTargetDate?.trim()
        ? new Date(data.savingsGoalTargetDate).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // default 1 year

      const goal =
        typeof data.savingsGoalAmount === 'number' && isFinite(data.savingsGoalAmount) && data.savingsGoalAmount > 0
          ? data.savingsGoalAmount
          : 0;

      const { error: sError } = await supabase.from('savings').insert({
        user_id: user.id,
        goal,
        name: data.savingsGoalReward?.trim() || 'Savings goal',
        description: data.savingsGoalDescription ?? data.savingsGoalReward ?? null,
        expire_at: expireAt,
      });

      if (sError) {
        throw new Error(`Failed to create savings: ${sError.message}`);
      }
    } catch (err) {
      console.error('Savings insert error:', err);
      throw err;
    }
  }

  // Mark onboarding as complete
  const { error: onboardingError } = await supabase
    .from('profiles')
    .update({ setup_complete: true })
    .eq('user_id', user.id);

  if (onboardingError) {
    throw new Error(`Failed to mark onboarding complete: ${onboardingError.message}`);
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

  // Support both interests (text[]) and legacy hobbies (jsonb) for initial data
  const raw = profile as Record<string, unknown>;
  const interests: string[] =
    Array.isArray(raw.interests) && raw.interests.length > 0
      ? (raw.interests as string[])
      : Array.isArray(raw.hobbies)
        ? (raw.hobbies as { name?: string }[]).map((h) => (typeof h === 'string' ? h : h?.name ?? '')).filter(Boolean)
        : [];

  return {
    id: profile.id,
    userId: profile.user_id,
    username: profile.username,
    monthlyBudget: profile.monthly_budget,
    currency: profile.currency,
    savingsGoalAmount: savings ? savings.goal : null,
    savingsGoalReward: savings ? savings.name : null,
    savingsGoalTargetDate: savings ? savings.expire_at : null,
    interests,
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
