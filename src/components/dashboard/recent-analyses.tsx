'use client';

import { useEffect, useState } from 'react';

import { getAnalyses } from '@/app/dashboard/actions';
import { Tables } from '@/lib/database.types';

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Tables<'transactions'>[]>([]);

  useEffect(() => {
    getAnalyses().then(setAnalyses);
  }, []);

  if (analyses.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 w-full text-center text-muted-foreground">
        <p>No analyses yet. Run a Quick Check to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Recent Impulse Analysis</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.transaction_id}
            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{analysis.transaction_description}</h3>
              <span className="text-sm text-muted-foreground">${analysis.amount}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
              {analysis.analysis ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
