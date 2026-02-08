'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransactionGoal } from '@/lib/dashboard.type';

interface Props {
  transactions: TransactionGoal[];
}

function parseUnit(time:number, unit:number, postfix:string) {
  let unitStr = '';
  let timeLeft = time;
  if (Math.floor(time / unit) > 0) {
    unitStr = `${Math.floor(time / unit)} ${postfix} `;
    timeLeft = timeLeft % unit;
  }
  return {
    unitStr,
    timeLeft,
  };
}

function parseTime(time:number) {
  const minute = 60000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = month * 12;
  const yearLeft = parseUnit(time, year, 'yrs');
  const monthLeft = parseUnit(yearLeft.timeLeft, month, 'mths');
  const dayLeft = parseUnit(monthLeft.timeLeft, day, 'days');
  const hourLeft = parseUnit(dayLeft.timeLeft, hour, 'hrs');
  const minuteLeft = parseUnit(hourLeft.timeLeft, minute, 'mins');
  return yearLeft.unitStr + monthLeft.unitStr + dayLeft.unitStr + hourLeft.unitStr + minuteLeft.unitStr;
}

export function calcuateTimeProgress(start:string, end:string) {
  const current = new Date().getTime();
  const beginning = new Date(start).getTime();
  const expiry = new Date(end).getTime();
  return  {
    timeLeft: parseTime(expiry - current),
    timeElapsed: parseTime(current - beginning),
    percentageProgressed: (current - beginning) / (expiry - beginning),
  };
}

export function CoolOffStatusCard({ transactions }: Props) {
  const validTransactions = transactions.filter(
    (t): t is TransactionGoal => t.cooloff_expiry != null && t.cooloff_expiry !== '',
  );

  if (validTransactions.length === 0) {
    return (
      <Card className="bg-card rounded-xl p-4 shadow-sm border border-border flex flex-col justify-between h-full min-h-[200px]">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-pulse" />
            <span>Reflection Window</span>
          </div>
          <h3 className="text-base font-bold text-foreground">No active cool-off period</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your recent purchase analyses will appear here when you run a check or send an item to cool-off.
          </p>
        </div>
        <div className="mt-3">
          <Link href="/analyze">
            <Button className="w-full py-2 px-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors">
              Run a quick check
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card rounded-xl p-4 shadow-sm border border-border flex flex-col justify-between h-full min-h-[200px]">
      <div className="overflow-x-auto snap-y snap-mandatory max-h-[320px] snap-always no-scrollbar">
        {validTransactions.map((transaction) => (
          <div key={transaction.transaction_id} className="snap-center py-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
              {transaction.transaction_description}
            </h3>
            {transaction.analysis && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                {transaction.analysis}
              </p>
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 min-w-0 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-[width]"
                  style={{ width: `${(calcuateTimeProgress(transaction.created_at, transaction.cooloff_expiry).percentageProgressed * 100).toFixed(2)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                {calcuateTimeProgress(transaction.created_at, transaction.cooloff_expiry).timeLeft} left
              </span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button
                type="button"
                className="flex-1 min-w-0 py-1.5 px-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] transition-colors flex items-center justify-center gap-1"
              >
                <span className="rounded-full bg-primary w-1.5 h-1.5 shrink-0" />
                <span className="truncate">Not buying</span>
              </button>
              <Link href={`/analyze?id=${transaction.transaction_id}`} className="flex-1 min-w-0">
                <Button variant="outline" size="sm" className="w-full h-7 text-[11px] rounded-full py-0 px-2">
                  Analyze again
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1 min-w-0 h-7 text-[11px] rounded-full py-0 px-2">
                I bought it
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
