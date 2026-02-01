'use server';

import { createClient } from '@/utils/supabase/server';

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

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!profile) {
    return null;
  }
  return profile;
}

export async function getTransactions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = new Date();
  const dayInMs = 86400000;
  const past = new Date(today.getTime() - dayInMs * 7);
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', past.toISOString())
    .order('created_at', { ascending: true });
  if (error) {
    throw new Error(`Failed to fetch user transactions: ${error.message}`);
  }

  if (!transactions) {
    return null;
  }
  return transactions;
}
