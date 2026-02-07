'use server';

import { revalidatePath } from 'next/cache';

import { Saving } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/server';

export async function getSavings():Promise<Saving[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: savings, error } = await supabase
    .from('savings')
    .select('*,total_amount')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch savings: ${error.message}`);
  }

  return savings || [];
}

export async function createSavingsGoal(data: {
  name: string;
  goal: number;
  description?: string;
  expire_at?: string;
}): Promise<Tables<'savings'>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if user has any existing goals
  const { data: existingGoals, error: countError } = await supabase
    .from('savings')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (countError) {
    throw new Error(`Failed to check existing goals: ${countError.message}`);
  }

  // Only auto-activate if this is the first goal
  const isFirstGoal = !existingGoals || existingGoals.length === 0;

  const { data: newSavings, error } = await supabase
    .from('savings')
    .insert({
      user_id: user.id,
      name: data.name,
      goal: data.goal,
      description: data.description || null,
      expire_at: data.expire_at ? new Date(data.expire_at).toISOString() : null,
      is_active: isFirstGoal,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create savings goal: ${error.message}`);
  }

  // Set the foreign key of the profile's active savings goal if this is the first goal
  if (isFirstGoal) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_saving: newSavings.id })
      .eq('user_id', user.id);
    if (profileError) {
      throw new Error(`Failed to update profile's active saving: ${profileError.message}`);
    }
  }

  revalidatePath('/savings');
  revalidatePath('/dashboard');

  return newSavings;
}

export async function updateSavingsGoal(
  id: number,
  data: Partial<{
    name: string;
    goal: number;
    description: string;
    expire_at: string;
  }>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the saving belongs to the user
  const { data: saving } = await supabase
    .from('savings')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!saving || saving.user_id !== user.id) {
    throw new Error('Savings goal not found or unauthorized');
  }

  const updateData: Record<string, string | number | null> = {};

  if (data.name !== undefined) {updateData.name = data.name;}
  if (data.goal !== undefined) {updateData.goal = data.goal;}
  if (data.description !== undefined) {updateData.description = data.description;}
  if (data.expire_at !== undefined) {
    updateData.expire_at = data.expire_at ? new Date(data.expire_at).toISOString() : null;
  }

  const { error } = await supabase
    .from('savings')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update savings goal: ${error.message}`);
  }

  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

export async function deleteSavingsGoal(id: number): Promise<number | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the saving belongs to the user and get its active status
  const { data: saving } = await supabase
    .from('savings')
    .select('user_id, is_active')
    .eq('id', id)
    .single();

  if (!saving || saving.user_id !== user.id) {
    throw new Error('Savings goal not found or unauthorized');
  }

  const wasActive = saving.is_active;

  const { error } = await supabase
    .from('savings')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete savings goal: ${error.message}`);
  }

  // If the deleted goal was active, activate another goal if one exists
  let nextActiveId: number | null = null;
  if (wasActive) {
    const { data: nextGoal } = await supabase
      .from('savings')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (nextGoal) {
      await supabase
        .from('savings')
        .update({ is_active: true })
        .eq('id', nextGoal.id);
      nextActiveId = nextGoal.id;

      // Update the profile's active_saving foreign key
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active_saving: nextActiveId })
        .eq('user_id', user.id);
      if (profileError) {
        throw new Error(`Failed to update profile's active saving: ${profileError.message}`);
      }
    }
  }

  revalidatePath('/savings');
  revalidatePath('/dashboard');

  return nextActiveId;
}

export async function setActiveSavingsGoal(id: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the saving belongs to the user
  const { data: saving } = await supabase
    .from('savings')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!saving || saving.user_id !== user.id) {
    throw new Error('Savings goal not found or unauthorized');
  }

  // Deactivate all other goals for this user
  const { error: deactivateError } = await supabase
    .from('savings')
    .update({ is_active: false })
    .eq('user_id', user.id);

  if (deactivateError) {
    throw new Error(`Failed to deactivate other goals: ${deactivateError.message}`);
  }

  // Activate the selected goal
  const { error: activateError } = await supabase
    .from('savings')
    .update({ is_active: true })
    .eq('id', id);

  if (activateError) {
    throw new Error(`Failed to activate savings goal: ${activateError.message}`);
  }

  // Update the profile's active_saving foreign key
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ active_saving: id })
    .eq('user_id', user.id);
  if (profileError) {
    throw new Error(`Failed to update profile's active saving: ${profileError.message}`);
  }

  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

export async function getActiveSavingsGoal() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: saving } = await supabase
    .from('savings')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  return saving || null;
}
