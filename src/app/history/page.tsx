import { AppLayout } from '@/components/app-layout';
import { RecentAnalyses } from '@/components/dashboard/recent-analyses';

export default function HistoryPage() {
  return (
    <AppLayout>
      <RecentAnalyses />
    </AppLayout>
  );
}
