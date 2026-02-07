'use client';

import Header from '@/components/home/header/header';
import { OnboardingNotification } from '@/components/onboarding/onboarding-notification';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

import { AppMobileNav, AppSidebar } from './app-sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <div className="min-h-screen bg-muted">
      <OnboardingNotification user={user} />
      <Header user={user} />
      <AppMobileNav />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-6">
        <AppSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
