import { AppLayout } from '@/components/app-layout';
import { SavingsPageContent } from '@/components/savings/savings-page-content';

export const metadata = {
  title: 'Savings Goals - MoneyGuard',
  description: 'Manage your savings goals',
};

export default function SavingsPage() {
  return (
    <AppLayout>
      <SavingsPageContent />
    </AppLayout>
  );
}
