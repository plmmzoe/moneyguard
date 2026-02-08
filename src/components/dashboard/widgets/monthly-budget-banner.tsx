'use client';

import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  budget: number;
  currency: string;
  /** Sum of amounts from history (transactions) where user chose "skipped" (decided not to buy). */
  monthlySpending: number;
}

function formatCurrency(value: number, currency: string) {
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetBanner({ budget, currency, monthlySpending }: Props) {
  const left = Math.max(0, budget - monthlySpending);
  const percentUsed = budget > 0 ? (100 * monthlySpending) / budget : 0;
  const percentLeft = Math.max(0, 100 - percentUsed);

  return (
    <Card className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          <Wallet className="w-3 h-3" />
          <span>Monthly budget</span>
        </div>
      </div>
      <h3 className="text-base font-bold text-foreground leading-tight">
        {formatCurrency(left, currency)} left this month
      </h3>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 min-w-0 bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
          {percentLeft.toFixed(0)}% left
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {formatCurrency(monthlySpending, currency)} / {formatCurrency(budget, currency)} used
      </p>
      <div className="mt-3 flex gap-2">
        <Link href="/analyze" className="w-3/4 min-w-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full text-xs font-semibold"
          >
            Reconsider new purchase
          </Button>
        </Link>
        <Link href="/profile" className="w-1/4 min-w-0 ml-auto">
          <Button
            size="sm"
            className="w-full rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </Button>
        </Link>
      </div>
    </Card>
  );
}
