'use client';

import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  budget: number;
  currency: string;
  /** Sum of amounts from history (transactions) where user chose "skipped" (decided not to buy). */
  monthlySpending: number;
}
export function BudgetBanner({ budget, currency, monthlySpending }:Props) {
  return (
    <Card className="rounded-xl border-2 border-primary/40 bg-primary/15 p-5 md:p-6 flex flex-col md:flex-row items-center md:items-center gap-6 shadow-md shadow-primary/10">
      <div className="flex items-center gap-4 w-full">
        <div className="flex flex-col gap-1 w-full">
          <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
            You have {budget - monthlySpending}$ left for your budget this month
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 text-xs font-medium text-foreground">
              <span>{(100 - (100 * monthlySpending / budget)).toFixed(2)}% left</span>
              <span className={'ml-auto'}>
                {monthlySpending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{' '}
                {currency} / {budget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{' '}
                {currency}
              </span>
            </div>
            <div className="w-full bg-primary/70 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary-foreground/80 transition-all duration-500"
                style={{ width: `${(100 * monthlySpending / budget).toFixed(2)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <Link href="/analyze" className="shrink-0 w-full md:w-auto">
        <Button className="w-full md:w-auto px-6 h-10 rounded-full bg-primary hover:bg-primary/90 text-background font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span>Reconsider new purchase</span>
        </Button>
      </Link>
    </Card>
  );
}
