'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransactionGoal } from '@/lib/dashboard.type';;

interface Props {
  transactions: TransactionGoal[] | [];
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
  const yearLeft = parseUnit(time, year, 'years');
  const monthLeft = parseUnit(yearLeft.timeLeft, month, 'months');
  const dayLeft = parseUnit(monthLeft.timeLeft, day, 'days');
  const hourLeft = parseUnit(dayLeft.timeLeft, hour, 'hours');
  const minuteLeft = parseUnit(hourLeft.timeLeft, minute, 'minutes');
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
  return (
    <Card className="bg-card rounded-xl p-5 shadow-sm border border-border flex flex-col justify-between h-full min-h-[280px]">
      <div className={'overflow-x-auto snap-y snap-mandatory h-[260px] snap-always no-scrollbar'}>
        {transactions.map((transaction) => (
          <div key={transaction.transaction_id} className={'snap-center mb-7 mt-2'}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Cooloff progress: {(calcuateTimeProgress(transaction.created_at, transaction.cooloff_expiry).percentageProgressed * 100).toFixed(1)} %</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {transaction.transaction_description}
                </h3>
                {transaction.analysis && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {transaction.analysis}
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
                <span>{calcuateTimeProgress(transaction.created_at, transaction.cooloff_expiry).timeLeft} left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(calcuateTimeProgress(transaction.created_at, transaction.cooloff_expiry).percentageProgressed * 100).toFixed(2)}%` }}
                />
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
                <Link href={`/analyze?id=${transaction.transaction_id}`} className="flex-1">
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
          </div>
        ))}
      </div>
    </Card>
  );
}
