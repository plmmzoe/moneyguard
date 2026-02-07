'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { createAuthApi } from 'shared/auth';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();
  const auth = createAuthApi(supabase);
  const { error } = await auth.signUp(data);

  if (error) {
    return { error: true };
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}
