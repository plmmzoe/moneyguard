'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { createAuthApi } from 'shared/auth';

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
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'https://paddle-billing.vercel.app/auth/callback',
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

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
