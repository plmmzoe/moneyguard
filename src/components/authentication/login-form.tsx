'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { login } from '@/app/login/actions';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function LoginForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    login({ email, password }).then((data) => {
      if (data?.error) {
        toast({ description: 'Invalid email or password', variant: 'destructive' });
      }
    });
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src="/assets/logo/logo.png" alt="MoneyGuard" width={80} height={80} className="rounded-xl" />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        Log in to your account
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button formAction={() => handleLogin()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Log in
      </Button>
      <div className={'text-center text-sm'}>
        Don&apos;t Have An Account?{' '}
        <Link href={'/signup'} className={'underline'}>
          Sign Up Here
        </Link>
      </div>
    </form>
  );
}
