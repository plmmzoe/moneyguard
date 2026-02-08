'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { createAuthApi } from 'shared/auth';

/** Base URL of the app (for OAuth redirect). Set NEXT_PUBLIC_SITE_URL in production. */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const auth = createAuthApi(supabase);
  const { error } = await auth.signInWithPassword(data);

  if (error) {
    return { error: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ spending_mindset: null }).eq('user_id', user.id);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  const auth = createAuthApi(supabase);
  await auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const baseUrl = getAppBaseUrl();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `anonymous+${Date.now().toString(36)}@themoneyguard.space`,
  });

  if (signInError || updateUserError) {
    return { error: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ spending_mindset: null }).eq('user_id', user.id);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
