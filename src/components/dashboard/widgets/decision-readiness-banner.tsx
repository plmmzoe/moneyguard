'use client';

import { cn } from '@/lib/utils';

interface Props {
  mindset: string | null;
}

export function DecisionReadinessBanner({ mindset }: Props) {
  if (!mindset) {
    return null;
  }

  const getStyles = (state: string) => {
    switch (state.toLowerCase()) {
      case 'calm':
      case 'not thinking about buying':
        return 'bg-emerald-50 text-emerald-700';
      case 'neutral':
      case 'just browsing':
        return 'bg-slate-50 text-slate-700';
      case 'tempted':
      case 'feeling tempted':
        return 'bg-amber-50 text-amber-700';
      case 'vulnerable':
      case 'about to buy':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div
      className={cn(
        'w-full py-2 px-4 text-sm font-medium text-center border-b border-border transition-colors',
        getStyles(mindset),
      )}
    >
      Today&apos;s spending mindset: <span className="font-bold">{mindset}</span>
    </div>
  );
}
