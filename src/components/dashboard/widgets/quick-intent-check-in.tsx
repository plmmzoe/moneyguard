'use client';

import { Flame, Search, ShoppingCart, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { updateMindset } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const colorThemes = {
  green: {
    card: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    cardSelected: 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300 ring-offset-2 ring-offset-background',
    iconBg: 'bg-emerald-100 group-hover:bg-emerald-200',
    iconText: 'text-emerald-700',
    labelText: 'text-emerald-900',
  },
  grey: {
    card: 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300',
    cardSelected: 'bg-slate-200 border-slate-400 ring-2 ring-slate-300 ring-offset-2 ring-offset-background',
    iconBg: 'bg-slate-100 group-hover:bg-slate-200',
    iconText: 'text-slate-700',
    labelText: 'text-slate-900',
  },
  yellow: {
    card: 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
    cardSelected: 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 ring-offset-2 ring-offset-background',
    iconBg: 'bg-amber-100 group-hover:bg-amber-200',
    iconText: 'text-amber-700',
    labelText: 'text-amber-900',
  },
  red: {
    card: 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300',
    cardSelected: 'bg-red-100 border-red-400 ring-2 ring-red-300 ring-offset-2 ring-offset-background',
    iconBg: 'bg-red-100 group-hover:bg-red-200',
    iconText: 'text-red-700',
    labelText: 'text-red-900',
  },
} as const;

const options = [
  {
    label: 'Not thinking about buying',
    value: 'Not thinking about buying',
    message: "Great. We'll be here when you need us.",
    action: null,
    icon: Smile,
    theme: 'green' as const,
  },
  {
    label: 'Just browsing',
    value: 'Just browsing',
    message: 'Want a quick guardrail while you scroll?',
    action: { label: 'Set a limit for yourself', href: '/profile' },
    icon: Search,
    theme: 'grey' as const,
  },
  {
    label: 'Feeling tempted',
    value: 'Feeling tempted',
    message: "Let's slow things down together.",
    action: { label: 'Talk through this purchase', href: '/analyze' },
    icon: Flame,
    theme: 'yellow' as const,
  },
  {
    label: 'About to buy',
    value: 'About to buy',
    message: 'Take 30 seconds before you decide.',
    action: { label: 'Run a quick check', href: '/analyze' },
    icon: ShoppingCart,
    theme: 'red' as const,
  },
] as const;

interface QuickIntentCheckInProps {
  /** Current spending mindset from profile (displayed and user can change). */
  initialMindset?: string | null;
}

export function QuickIntentCheckIn({ initialMindset = null }: QuickIntentCheckInProps) {
  const [selected, setSelected] = useState<string | null>(initialMindset ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelected(initialMindset ?? null);
  }, [initialMindset]);
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
            const theme = colorThemes[option.theme];

            const cardClasses = cn(
              'group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border text-center transition-all cursor-pointer min-h-[120px]',
              isSelected ? theme.cardSelected : theme.card,
            );

            const iconWrapperClasses = cn(
              'p-3 rounded-xl transition-colors',
              theme.iconBg,
              theme.iconText,
            );

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={loading}
                className={cardClasses}
              >
                <div className={iconWrapperClasses}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn('text-xs font-semibold leading-tight', theme.labelText)}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption && (
        <div className="mt-4 py-2.5 px-3 rounded-lg bg-muted/60 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-muted-foreground text-sm font-medium">{selectedOption.message}</p>
          {selectedOption.action && (
            <Button
              onClick={() => selectedOption.action?.href && router.push(selectedOption.action.href)}
              size="xs"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 text-xs font-semibold shrink-0"
            >
              {selectedOption.action.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
