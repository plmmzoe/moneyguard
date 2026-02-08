import { createExtensionSupabaseClient } from '../scripts/supabase-extension';
import { type Session, SupabaseClient, User } from '@supabase/supabase-js';
import { TransactionDetails } from '../shared/types.ts';
const STORAGE_KEY = 'supabase_session';

async function initClient() {
  // Use same Supabase project as the web app (same DB). Set in build: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
  // @ts-ignore
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  // @ts-ignore
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('Extension not configured. Build with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const client = await createExtensionSupabaseClient(url, anonKey);
  const stored = await new Promise<{ session?: Session }>((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      console.log(data);
      resolve({session:data.supabase_session} as { session?: Session });
    });
  });
  console.log(stored);
  if (stored?.session?.access_token) {
    await client.auth.setSession({
      access_token: stored.session.access_token,
      refresh_token: stored.session.refresh_token ?? '',
    });
  }else{
    throw new Error("no session");
  }
  return client;
}

export async function getUser(){
  const client = await initClient();
  if (!client) {
    throw new Error("client init failed");
  }
  const resp = await client.auth.getUser()
  if (resp) {
    return {user:resp.data.user?.id}
  }
  throw new Error("cannot get user");

}

export type SupabaseUser = User

export type Client = SupabaseClient

export async function getProfile(userID:string)  {
  const client = await initClient();
  if (!client) {
    throw new Error("client init failed");
  }
  console.log("userID")
  console.log(userID)
  if (userID) {
    const { data: profile, error } = await client
      .from('profiles')
      .select()
      .eq('user_id', userID)
      .single();
    if (profile) {
      console.log(profile);
      return profile;
    }
    if (error) throw error.message;
    throw new Error("cannot get profile");
  }
}

export async function addTransactions(itemDetails:TransactionDetails) {
  const client = await initClient();
  if (!client) {
    throw new Error("client init failed");
  }
  // @ts-ignore
  const {data,error} = await client
    .from('transactions')
    .insert(itemDetails)
  if (error){
    throw new Error(`Error posting transaction: ${error.message}`);
  }
}

/** Update transaction_state (and optionally cooloff_expiry for waiting). */
export async function updateTransactionState(
  userID: string,
  transactionId: string,
  transaction_state: string,
  cooloff_expiry?: string | null
): Promise<void> {
  const client = await initClient();
  if (!client) throw new Error('client init failed');
  const updates: { transaction_state: string; cooloff_expiry?: string | null } = { transaction_state };
  if (cooloff_expiry !== undefined) updates.cooloff_expiry = cooloff_expiry;
  const { error } = await client
    .from('transactions')
    .update(updates)
    .eq('transaction_id', transactionId)
    .eq('user_id', userID);
  if (error) throw new Error(`Error updating transaction state: ${error.message}`);
}