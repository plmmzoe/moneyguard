'use client';

import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function InlineQuickCheckTrigger() {
  return (
    <Card className="rounded-xl border-2 border-primary/40 bg-primary/15 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-primary/10">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-background rounded-full shadow-sm text-primary shrink-0">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">
            Thinking about buying something right now?
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Take 30 seconds before you decide. Your future self will thank you.
          </p>
        </div>
      </div>

      <Link href="/analyze" className="shrink-0 w-full md:w-auto">
        <Button className="w-full md:w-auto px-6 h-10 rounded-full bg-primary hover:bg-primary/90 text-background font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span>Analyze this purchase</span>
        </Button>
      </Link>
    </Card>
  );
}
