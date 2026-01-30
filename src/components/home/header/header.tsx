import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

import { signOut } from '@/app/login/actions';
import { Button } from '@/components/ui/button';

interface Props {
  user: User | null;
}

export default function Header({ user }: Props) {
  return (
    <nav>
      <div className="mx-auto max-w-7xl relative px-[32px] py-[18px] flex items-center justify-between">
        <div className="flex flex-1 items-center justify-start">
          <Link className="flex items-center" href="/">
            <Image className="w-auto block" src="/logo.svg" width={131} height={28} alt="MoneyGuard" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-2">
            {user?.id ? (
              <>
                <Button variant="secondary" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/onboarding">Profile</Link>
                </Button>
                <form action={signOut} className="inline">
                  <Button type="submit" variant="outline">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
