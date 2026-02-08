import '../../../styles/login.css';
import Link from 'next/link';

import { ResetPasswordForm } from '@/components/authentication/reset-password-form';
import { createClient } from '@/utils/supabase/server';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      <div className="mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg rounded-b-none login-card-border backdrop-blur-[6px]">
        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-[30px] leading-[36px] font-medium tracking-[-0.6px]">
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Use the link from your email to set a new password. That link may have expired.
            </p>
            <Link
              href="/auth/forgot-password"
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Send a new reset link
            </Link>
            <Link href="/login" className="mt-2 text-sm text-muted-foreground hover:text-primary">
              Back to log in
            </Link>
          </div>
        )}
      </div>
      <div className="mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 py-6 flex flex-col items-center justify-center rounded-b-lg border border-t-0 border-border">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Back to log in
        </Link>
      </div>
    </div>
  );
}
