'use server';

import { createClient } from '@/utils/supabase/server';

/** Save analysis as a new transaction in draft; transaction_state set by user via UI. Returns transaction_id (uuid). */
export async function saveAnalysis(data: {
  itemName: string;
  price: number;
  description?: string;
  /** Text to store in transactions.analysis (from unified response). */
  aiAnalysis: string;
  /** transactions.verdict */
  verdict?: 'high' | 'medium' | 'low';
  /** When cool-off ends (optional; set when user chooses "Send to cool-off"). */
  cooloff_expiry?: string;
}): Promise<{ transaction_id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const transaction_id = crypto.randomUUID();
  const { data: row, error } = await supabase
    .from('transactions')
    .insert({
      transaction_id,
      user_id: user.id,
      amount: data.price,
      transaction_description: data.itemName,
      analysis: data.aiAnalysis,
      verdict: data.verdict ?? null,
      transaction_state: 'draft',
      cooloff_expiry: data.cooloff_expiry ?? null,
    })
    .select('transaction_id')
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
  return { transaction_id: row.transaction_id };
}

/** Update transaction_state when user clicks I won't buy / I will buy / Send to cool-off / Just browsing. */
export async function updateTransactionState(
  transactionId: string,
  transaction_state: 'draft' | 'waiting' | 'discarded' | 'bought',
  cooloff_expiry?: string | null,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updates: { transaction_state: string; cooloff_expiry?: string | null } = { transaction_state };
  if (cooloff_expiry !== undefined) {updates.cooloff_expiry = cooloff_expiry;}

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('transaction_id', transactionId)
    .eq('user_id', user.id)
    .select('transaction_id')
    .maybeSingle();

  if (error) {
    console.error('Error updating transaction state:', error);
    throw new Error(`Failed to update: ${error.message}`);
  }
  if (!data) {
    console.error('Update matched no row:', { transactionId, userId: user.id });
    throw new Error('Transaction not found or you do not have permission to update it.');
  }
}
