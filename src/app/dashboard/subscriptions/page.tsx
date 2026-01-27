import { Suspense } from 'react';

import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Subscriptions } from '@/components/dashboard/subscriptions/subscriptions';

export default function SubscriptionsListPage() {
  return (
    <main className="p-4 lg:gap-6 lg:p-8">
      <Suspense fallback={<LoadingScreen />}>
        <Subscriptions />
      </Suspense>
    </main>
  );
}
