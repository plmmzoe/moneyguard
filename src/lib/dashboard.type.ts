import { Tables } from '@/lib/database.types';

export interface TransactionDated extends Tables<'transactions'> {
  date: Date | null;
}

export type TransactionData = Pick<Tables<'transactions'>, 'amount' | 'transaction_description' | 'created_at'> &
  Partial<Pick<Tables<'transactions'>, 'user_id' | 'transaction_state' | 'cooloff_expiry' | 'analysis' | 'verdict'>>;
