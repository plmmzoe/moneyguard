'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updatePassword } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        toast({ description: result.error, variant: 'destructive' });
        return;
      }
      setDone(true);
      toast({ description: 'Password updated. Signing you in…' });
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center text-center">
        <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
        <h1 className="text-[30px] leading-[36px] font-medium tracking-[-0.6px]">
          Password updated
        </h1>
        <p className="text-sm text-muted-foreground">
          Redirecting you to the dashboard…
        </p>
        <Link href="/dashboard" className="mt-4 text-sm font-medium text-primary hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center">
      <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
      <h1 className="text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center">
        Set new password
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        Enter your new password below.
      </p>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className="text-muted-foreground leading-5" htmlFor="new-password">
          New password
        </Label>
        <Input
          className="border-border rounded-xs"
          type="password"
          id="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={loading}
          minLength={6}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className="text-muted-foreground leading-5" htmlFor="confirm-password">
          Confirm password
        </Label>
        <Input
          className="border-border rounded-xs"
          type="password"
          id="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Same as above"
          disabled={loading}
          minLength={6}
        />
      </div>
      <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
        {loading ? 'Updating…' : 'Update password'}
      </Button>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
        Back to log in
      </Link>
    </form>
  );
}
