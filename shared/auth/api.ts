import type { SupabaseClient } from '@supabase/supabase-js';

import type { AuthCredentials, AuthResult } from './types';

export function createAuthApi(supabase: SupabaseClient) {
  return {
    async signInWithPassword(credentials: AuthCredentials): Promise<AuthResult> {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      return { error: !!error };
    },

    async signUp(credentials: AuthCredentials): Promise<AuthResult> {
      const { error } = await supabase.auth.signUp(credentials);
      return { error: !!error };
    },

    async signOut(): Promise<void> {
      await supabase.auth.signOut();
    },

    async getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },

    async getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },

    onAuthStateChange(callback: (event: string, session: unknown) => void) {
      return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
