'use client';

import { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { signOut } from '@/app/login/actions';
import { Button } from '@/components/ui/button';

interface Props {
  user: User | null;
}

export default function Header({ user }: Props) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo/logo.png"
              alt="MoneyGuard"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <span className="text-2xl font-bold text-[#465869]">MoneyGuard</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user?.id ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/onboarding"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/analyze"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Analyze
              </Link>
              <form action={signOut} className="inline">
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
