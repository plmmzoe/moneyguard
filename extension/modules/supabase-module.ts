import { createExtensionSupabaseClient } from '../scripts/supabase-extension';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { createAuthApi } from '../../shared/auth';
import { Item } from '../shared/types.ts';
import { TransactionData } from '../../src/lib/dashboard.type.ts';

export async function getUser(){
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('Extension not configured. Build with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const client = await createExtensionSupabaseClient(url,anonKey);
  const auth = createAuthApi(client);
  const sessionUser = await auth.getUser();
  return {user:sessionUser, client:client};
}

export type SupabaseUser = User

export type Client = SupabaseClient

export async function getProfile(sessionUser:SupabaseUser|null, client:Client)  {
  let userContext = '';
  if (sessionUser) {
    const { data: profile } = await client
      .from('profiles')
      .select()
      .eq('user_id', sessionUser.id)
      .single();

    if (profile) {
      userContext = JSON.stringify(profile);
    }
  }
  return userContext;
}

export async function updateSavings(sessionUser:SupabaseUser, client:Client, amount:number){
  // @ts-ignore
  const {data,error} = await client
    .rpc('increment', { x: amount, row_id: sessionUser.id });
  if (error){
    throw new Error(`Error posting transaction: ${error.message}`);
  }
}

export async function addTransactions(sessionUser:SupabaseUser, client:Client, items: Item[]) {
  const current = new Date();
  const transactionItems = items.map((item:Item) : TransactionData => {
    return {
      amount: item.quantity * item.price,
      created_at: current.toISOString(),
      transaction_description: item.name,
      user_id: sessionUser.id
    }
  })
  // @ts-ignore
  const {data,error} = await client
    .from('transactions')
    .insert(transactionItems)

  if (error){
    throw new Error(`Error posting transaction: ${error.message}`);
  }
}