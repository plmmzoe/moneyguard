import Link from 'next/link';

import { AppLayout } from '@/components/app-layout';
import { SavingsPageContent } from '@/components/savings/savings-page-content';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Savings Goals - MoneyGuard',
  description: 'Manage your savings goals',
};

export default async function SavingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto rounded-xl bg-card border border-border p-4 sm:p-6 md:p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your goals.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SavingsPageContent />
    </AppLayout>
  );
}
