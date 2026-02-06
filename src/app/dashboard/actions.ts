'use server';

import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/server';

export type TransactionData = Omit<Tables<'transactions'>, 'user_id'|'transaction_id'> & Partial<Pick<Tables<'transactions'>, 'user_id'>>;

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

  if (!profile) {
    return null;
  }

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
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

  if (!transactions) {
    return null;
  }

  if (error) {
    throw new Error(`Failed to fetch user transactions: ${error.message}`);
  }

  return transactions;
}

export async function getAnalyses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data;
}

export async function postTransaction(transactionData:TransactionData) {
  const supabase = await createClient();
  const transaction = transactionData;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }
  transaction.user_id = user.id;
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction]);

  if (error) {
    console.error('Failed to post user transaction:', error);
    throw new Error(`Error posting transaction: ${error.message}`);
  }

  return data;
}

export async function deleteTransactions(transactionIds:number[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  if (error) {
    console.error('Failed to delete user transaction:', error);
    throw new Error(`Error deleting transaction: ${error.message}`);
  }

  return data;
}

/** Sum of transaction amounts where user chose "skipped" (decided not to buy). Derived from history/transactions. */
export async function getSavedTowardsGoal(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, transaction_description')
    .eq('user_id', user.id);

  if (error || !transactions) {
    return 0;
  }

  const skipped = transactions.filter(
    (t) => t.transaction_description?.toLowerCase().includes('status: skipped'),
  );
  return skipped.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

export async function updateMindset(mindset: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ spending_mindset: mindset })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating mindset:', error);
    throw new Error('Failed to update mindset');
  }
}
