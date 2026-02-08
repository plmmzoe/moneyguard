import '../../../styles/login.css';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/authentication/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg rounded-b-none login-card-border backdrop-blur-[6px]">
        <ForgotPasswordForm />
      </div>
      <div className="mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 py-6 flex flex-col items-center justify-center rounded-b-lg border border-t-0 border-border">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Back to log in
        </Link>
      </div>
    </div>
  );
}
