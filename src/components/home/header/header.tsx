'use client';

import { User as SupabaseUser } from '@supabase/supabase-js';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { signOut } from '@/app/login/actions';
import { Button } from '@/components/ui/button';

interface Props {
  user: SupabaseUser | null;
}

export default function Header({ user }: Props) {
  return (
    <nav className="bg-card border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/assets/logo/logo.png"
              alt="MoneyGuard"
              width={60}
              height={60}
              className="rounded-xl shrink-0 w-10 h-10 sm:w-[60px] sm:h-[60px]"
              priority
            />
            <span className="text-lg sm:text-2xl font-bold text-[#465869] truncate">MoneyGuard</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user?.id ? (
            <>
              <Link
                href="/dashboard"
                className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="Dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
              <Link
                href="/profile"
                className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <form action={signOut} className="inline">
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className="bg-card border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
