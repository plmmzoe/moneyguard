'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { signup } from '@/app/signup/actions';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validatePassword } from 'shared/auth';

export function SignupForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const { valid, message } = validatePassword(password);
    if (!valid) {
      toast({ description: message ?? 'Invalid password', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await signup({ email, password });
      if (data?.error) {
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button
        type="submit"
        variant={'secondary'}
        className={'w-full'}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up…
          </>
        ) : (
          'Sign up'
        )}
      </Button>
    </form>
  );
}
