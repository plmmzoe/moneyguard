import { Tables } from '@/lib/database.types';

export interface TransactionDated extends Tables<'transactions'> {
  date: Date | null;
}

export type TransactionData = Omit<Tables<'transactions'>, 'user_id'|'transaction_id'> & Partial<Pick<Tables<'transactions'>, 'user_id'>>;

export type TransactionGoal = Tables<'transactions'> & {
  cooloff_expiry: string;
  transaction_state: 'bought' | 'waiting' | 'discarded' | 'draft';
};

export type Profile = Tables<'profiles'> & {
  savings:Tables<'savings'> | null
}
