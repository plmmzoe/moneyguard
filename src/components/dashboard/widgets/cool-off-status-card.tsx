'use client';

import { Hourglass } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tables } from '@/lib/database.types';

interface Props {
  latestAnalysis: Tables<'analyses'> | null;
}

export function CoolOffStatusCard({ latestAnalysis }: Props) {
  if (!latestAnalysis) {
    return (
      <Card className="bg-card rounded-xl p-5 shadow-sm border border-border flex flex-col justify-between h-full min-h-[280px]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-pulse" />
            <span>Reflection Window</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">No active cool-off period</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your recent purchase analyses will appear here when you run a check.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Link href="/analyze">
            <Button className="w-full py-2.5 px-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <Hourglass className="w-4 h-4" />
              <span>Run a quick check</span>
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Calculate time since analysis relative to a 24h cool-off window
  const created = new Date(latestAnalysis.created_at);
  const now = new Date();
  const totalHours = 24;
  const elapsedHours = Math.min(
    totalHours,
    Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60)),
  );
  const remainingHours = Math.max(0, Math.ceil(totalHours - elapsedHours));
  const progressPercent = (elapsedHours / totalHours) * 100;

  return (
    <Card className="bg-card rounded-xl p-5 shadow-sm border border-border flex flex-col justify-between h-full min-h-[280px]">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Reflection Window</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {latestAnalysis.item_name}
            </h3>
            {latestAnalysis.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {latestAnalysis.description}
              </p>
            )}
          </div>
          <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
            {/* Placeholder for product image */}
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Cooling off</span>
            <span>{remainingHours} hours left</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <button
          type="button"
          className="w-full py-2.5 px-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="inline-block rounded-full bg-primary w-2 h-2" />
          <span>I decided not to buy</span>
        </button>
        <div className="flex gap-2">
          <Link href={`/analyze?id=${latestAnalysis.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full py-2.5 px-4 rounded-full border-border hover:bg-muted text-muted-foreground font-medium text-sm transition-colors"
            >
              Analyze again
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 py-2.5 px-4 rounded-full border-border hover:bg-muted text-muted-foreground font-medium text-sm transition-colors"
          >
            I bought it
          </Button>
        </div>
      </div>
    </Card>
  );
}
