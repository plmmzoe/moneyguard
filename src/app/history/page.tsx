import { AppLayout } from '@/components/app-layout';
import { RecentAnalyses } from '@/components/dashboard/recent-analyses';

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto">
        <RecentAnalyses />
      </div>
    </AppLayout>
  );
}
