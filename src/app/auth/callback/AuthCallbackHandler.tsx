'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const done = useRef(false);

  useEffect(() => {
    if (done.current) {
      return;
    }
    done.current = true;

    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/dashboard';

    const supabaseClient = createClient();
    if (!supabaseClient) {
      router.replace('/auth/auth-code-error');
      return;
    }
    // Narrow type for use inside async run() so TS never treats as null
    const client = supabaseClient as SupabaseClient;

    async function run() {
      // 1. PKCE: code in query
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          return;
        }
      }

      // 2. Recovery / magic link: token_hash + type in query
      if (tokenHash && (type === 'recovery' || type === 'magiclink' || type === 'email')) {
        const { error } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'recovery' | 'magiclink' | 'email',
        });
        if (!error) {
          router.replace(next);
          return;
        }
      }

      // 3. Session might be in hash (Supabase redirect) – client auto-detects; wait for it then redirect
      if (!code && !tokenHash) {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (hash) {
          for (let i = 0; i < 5; i++) {
            await new Promise((r) => setTimeout(r, 300));
            const { data: { session } } = await client.auth.getSession();
            if (session) {
              router.replace(next);
              return;
            }
          }
        }
      }

      setStatus('error');
      router.replace(`/auth/auth-code-error?next=${encodeURIComponent(next)}`);
    }

    run();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Something went wrong. The link may have expired.</p>
        <a href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
