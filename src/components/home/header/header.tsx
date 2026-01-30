'use client';

import { User } from '@supabase/supabase-js';
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
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            SpendGuard AI
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
              <form action={signOut} className="inline">
                <Button type="submit" variant="outline" size="sm">
                  Sign out
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
