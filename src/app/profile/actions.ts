'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

export async function updateProfile(data: {
  username: string;
  monthly_budget: number;
  currency: string;
  monthly_irregular_spending?: number | null;
  interests?: string[] | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: data.username,
      monthly_budget: data.monthly_budget,
      currency: data.currency,
      monthly_irregular_spending:
        data.monthly_irregular_spending != null ? data.monthly_irregular_spending : null,
      interests: data.interests != null ? data.interests : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
}
