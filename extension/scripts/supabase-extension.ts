import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'supabase_session';

export async function createExtensionSupabaseClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error('Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY when building.');
  }
  const client = createClient(url, anonKey);

  const stored = await new Promise<{ session?: Session }>((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      resolve(data as { session?: Session });
    });
  });

  if (stored?.session?.access_token) {
    await client.auth.setSession({
      access_token: stored.session.access_token,
      refresh_token: stored.session.refresh_token ?? '',
    });
  }

  client.auth.onAuthStateChange((_event, session) => {
    if (session) {
      chrome.storage.local.set({ [STORAGE_KEY]: session });
    } else {
      chrome.storage.local.remove(STORAGE_KEY);
    }
  });

  return client;
}
