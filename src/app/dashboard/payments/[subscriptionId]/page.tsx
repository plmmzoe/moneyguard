'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { PaymentsContent } from '@/components/dashboard/payments/payments-content';

export default function SubscriptionsPaymentPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Payments'} />
      <Suspense fallback={<LoadingScreen />}>
        <PaymentsContent subscriptionId={subscriptionId} />
      </Suspense>
    </main>
  );
}
