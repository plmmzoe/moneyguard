'use server';

import { Profile, TransactionData, TransactionGoal } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/server';

export async function getProfile():Promise<Profile|null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      savings (*,total_amount)
    `)
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
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!transactions) {
    return null;
  }

  if (error) {
    throw new Error(`Failed to fetch user transactions: ${error}`);
  }

  return transactions;
}

/** Recent transactions (e.g. from Quick Check) for RecentAnalyses list. */
export async function getAnalyses(): Promise<Tables<'transactions'>[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data ?? [];
}

export async function updateTransaction(transactionData:Partial<Tables<'transactions'>>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .update(transactionData)
    .eq('transaction_id', transactionData.transaction_id);

  if (error) {
    console.error('Failed to update user transaction:', error);
    throw new Error(`Error updating transaction: ${error.message}`);
  }

  return data ?? [];
}

export async function updateTransactions(transactionData:Partial<Tables<'transactions'>>, ids:string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .update(transactionData)
    .in('transaction_id', ids);

  if (error) {
    console.error('Failed to update user transaction:', error);
    throw new Error(`Error updating transaction: ${error.message}`);
  }

  return data ?? [];
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

export async function deleteTransactions(transactions:Tables<'transactions'>[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }
  const ids = transactions.map((t) => {return t.transaction_id;});
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', ids);
  if (error) {
    console.error('Failed to delete user transaction:', error);
    throw new Error(`Error deleting transaction: ${error.message}`);
  }
  return data;
}

/** Sum of transaction amounts where user chose "skipped" (decided not to buy). Derived from history/transactions. */
export async function getTotalSaved(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, transaction_state')
    .eq('transaction_state', 'discarded')
    .eq('user_id', user.id);

  if (error || !transactions) {
    return 0;
  }
  let sum = 0;
  transactions.forEach((transaction) => { sum += transaction.amount;});
  return sum;
}

export async function getTransactionPeriod(days:number): Promise<Tables<'transactions'>[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }
  const dayInMs = 86400000;
  const timeDelta = days * dayInMs;
  const current = new Date();
  const limit = new Date(current.getTime() - timeDelta);
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select()
    .eq('transaction_state', 'bought')
    .lt('created_at', current.toISOString())
    .gt('created_at', limit.toISOString())
    .eq('user_id', user.id);

  if (error || !transactions) {
    return [];
  }
  return transactions;
}

/** Get up to 5 most recent transactions where user chose to wait. */
export async function getCoolOffs(): Promise<TransactionGoal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('transaction_state', 'waiting')
    .order('cooloff_expiry', { ascending: true })
    .limit(5);
  if (error || !transactions) {
    return [];
  }
  return transactions;
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
