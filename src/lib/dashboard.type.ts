import { Tables } from '@/lib/database.types';

export interface TransactionDated extends Tables<'transactions'> {
  date: Date | null;
}

export type TransactionData = Omit<Tables<'transactions'>, 'user_id'|'transaction_id'> & Partial<Pick<Tables<'transactions'>, 'user_id'>>;
