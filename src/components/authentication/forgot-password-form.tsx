'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { requestPasswordReset } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast({ description: 'Please enter your email.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result.error) {
        toast({ description: result.error, variant: 'destructive' });
        return;
      }
      setSent(true);
      toast({ description: 'Check your email for a link to reset your password.' });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center text-center">
        <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
        <h1 className="text-[30px] leading-[36px] font-medium tracking-[-0.6px]">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to <strong className="text-foreground">{email}</strong>.
          Click the link to set a new password.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn’t receive the email? Check spam or{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
        <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center">
      <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
      <h1 className="text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center">
        Forgot password?
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Enter your email and we’ll send you a link to reset your password.
      </p>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className="text-muted-foreground leading-5" htmlFor="forgot-email">
          Email address
        </Label>
        <Input
          className="border-border rounded-xs"
          type="email"
          id="forgot-email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>
      <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
        Back to log in
      </Link>
    </form>
  );
}
