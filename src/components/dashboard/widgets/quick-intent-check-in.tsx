'use client';

import { Flame, Search, ShoppingCart, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateMindset } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const options = [
  {
    label: 'Not thinking about buying',
    value: 'Not thinking about buying',
    message: "Great. We'll be here when you need us.",
    action: null,
    icon: Smile,
    iconClass: 'text-emerald-600',
  },
  {
    label: 'Just browsing',
    value: 'Just browsing',
    message: 'Want a quick guardrail while you scroll?',
    action: { label: 'Set a soft limit for today', href: '#' },
    icon: Search,
    iconClass: 'text-blue-600',
  },
  {
    label: 'Feeling tempted',
    value: 'Feeling tempted',
    message: "Let's slow things down together.",
    action: { label: 'Talk through this purchase', href: '/analyze' },
    icon: Flame,
    iconClass: 'text-amber-600',
  },
  {
    label: 'About to buy',
    value: 'About to buy',
    message: 'Take 30 seconds before you decide.',
    action: { label: 'Run a quick check', href: '/analyze' },
    icon: ShoppingCart,
    iconClass: 'text-red-600',
  },
] as const;

export function QuickIntentCheckIn() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSelect(value: string) {
    setSelected(value);
    setLoading(true);
    try {
      await updateMindset(value);
      toast({ description: 'Mindset updated.' });
      router.refresh();
    } catch {
      toast({ description: 'Failed to update mindset.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = options.find((o) => o.value === selected) ?? null;

  return (
    <Card className="rounded-xl border border-border bg-card p-6 md:p-10 shadow-sm">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            How are you feeling about spending right now?
          </h1>
          <p className="text-sm text-muted-foreground">
            Select the option that best matches your current state of mind.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {options.map((option) => {
            const isSelected = selected === option.value;
            const Icon = option.icon;

            const isTempted = option.value === 'Feeling tempted';
            const cardClasses = cn(
              'group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border text-center transition-all cursor-pointer min-h-[120px]',
              isTempted && (isSelected ? 'bg-amber-100 border-amber-300' : 'bg-amber-50 border-amber-200'),
              !isTempted && isSelected && 'bg-primary/10 border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
              !isTempted && !isSelected && 'bg-muted/30 border-border hover:border-primary hover:bg-primary/5',
            );

            const iconWrapperClasses = cn(
              'p-3 rounded-xl transition-colors',
              isTempted && 'bg-amber-100 group-hover:bg-amber-200',
              !isTempted && isSelected && 'bg-primary/20',
              !isTempted && !isSelected && 'bg-background group-hover:bg-primary/10',
            );

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={loading}
                className={cardClasses}
              >
                <div className={cn(iconWrapperClasses, isTempted ? 'text-amber-700' : isSelected ? 'text-primary' : option.iconClass)}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  'text-xs font-semibold leading-tight',
                  isTempted ? 'text-amber-900' : isSelected ? 'text-primary' : 'text-foreground',
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption && (
        <div className="mt-6 p-4 rounded-xl bg-muted/60 text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-muted-foreground mb-3 font-medium">{selectedOption.message}</p>
          {selectedOption.action && (
            <Button
              onClick={() => selectedOption.action?.href && router.push(selectedOption.action.href)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              {selectedOption.action.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
