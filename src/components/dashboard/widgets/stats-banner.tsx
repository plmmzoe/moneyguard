'use client';

import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function StatsBanner({ totalSpending }:{totalSpending:number}) {
  return (
    <Card className="rounded-xl border-2 border-primary/40 bg-primary/15 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-primary/10">
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
            MoneyGuard has helped you avoid {totalSpending}$ in spending
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Care to save some more?
          </p>
        </div>
      </div>

      <Link href="/analyze" className="shrink-0 w-full md:w-auto">
        <Button className="w-full md:w-auto px-6 h-10 rounded-full bg-primary hover:bg-primary/90 text-background font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span>Analyze new purchase</span>
        </Button>
      </Link>
    </Card>
  );
}
