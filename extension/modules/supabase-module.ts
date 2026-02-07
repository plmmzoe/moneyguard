import { createExtensionSupabaseClient } from '../scripts/supabase-extension';
import { type Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Item } from '../shared/types.ts';
import { TransactionData } from '../../src/lib/dashboard.type.ts';
const STORAGE_KEY = 'supabase_session';

async function initClient() {
  // @ts-ignore
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  // @ts-ignore
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('Extension not configured. Build with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const client = await createExtensionSupabaseClient(url,anonKey);
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

export async function updateSavings(userID:string, amount:number){
  const client = await initClient();
  if (!client) {
    throw new Error("client init failed");
  }
  // @ts-ignore
  const {data,error} = await client
    .rpc('increment', { x: parseFloat(amount.toString()), row_id: userID });
  if (error){
    throw new Error(`Error updating profile: ${error.message}`);
  }
}

export async function addTransactions(userID:string, items: Item[]) {
  const client = await initClient();
  if (!client) {
    throw new Error("client init failed");
  }
  const current = new Date();
  const transactionItems = items.map((item:Item) : TransactionData => {
    return {
      amount: item.quantity * item.price,
      created_at: current.toISOString(),
      transaction_description: item.name,
      user_id: userID
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