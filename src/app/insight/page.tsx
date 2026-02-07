'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient as createBrowserSupabase } from '@/utils/supabase/client';

interface TransactionData {
  id?: string;
  date: string;
  merchant?: string;
  payee?: string;
  amount?: number;
  price?: number;
}

interface SummaryData {
  total: number;
  count: number;
  avg: number;
}

interface MerchantData {
  merchant: string;
  total: number;
  count: number;
}

interface LocalAnalysis {
  summary: SummaryData;
  topMerchants: MerchantData[];
  impulseCandidates: TransactionData[];
}

interface AnalysisResponse {
  source?: string;
  response?: string;
  local?: LocalAnalysis;
  analysis?: Record<string, unknown>;
  transactions?: TransactionData[];
  error?: string;
  text?: string;
}

export default function InsightPage() {
  const supabase = createBrowserSupabase();
  const { user } = useUserInfo(supabase);

  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!user) {
      setError('Please sign in to view your analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const json: AnalysisResponse = await res.json();
      setData(json);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  if (!user) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your insight.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="rounded-xl bg-card border border-border p-6 w-full max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Insight</h1>
          <p className="text-muted-foreground">
            View your transaction history over a chosen period. See totals, top merchants, and which
            recent small purchases might be impulse buys—so you can spot patterns and adjust spending.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Range</CardTitle>
              <CardDescription>Select how far back to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex flex-col gap-3">
                <Label>Period</Label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-md border px-3 py-2 w-fit"
                >
                  <option value="day">Past day</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                </select>
              </div>
              <div className="ml-auto">
                <Button onClick={fetchAnalysis} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Insight'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card>
              <CardContent>
                <div className="text-destructive">{error}</div>
              </CardContent>
            </Card>
          )}

          {data && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Source: {data.source ?? 'local'}</CardDescription>
              </CardHeader>
              <CardContent>
                {data.error && <div className="text-destructive">{data.error}</div>}

                {data.response && (
                  <div className="whitespace-pre-wrap leading-relaxed text-base">{data.response}</div>
                )}

                {data.analysis && (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(data.analysis, null, 2)}</pre>
                )}

                {data.local && (
                  <div className="space-y-4">
                    <div>
                      <strong>Total:</strong> ${Math.round((data.local.summary?.total ?? 0) * 100) / 100}
                    </div>
                    <div>
                      <strong>Transactions:</strong> {data.local.summary?.count ?? 0}
                    </div>
                    <div>
                      <strong>Average:</strong> ${Math.round((data.local.summary?.avg ?? 0) * 100) / 100}
                    </div>

                    <div>
                      <strong>Top Merchants</strong>
                      <ul>
                        {(data.local.topMerchants ?? []).map((m: MerchantData) => (
                          <li key={m.merchant}>
                            {m.merchant} — ${Math.round(m.total * 100) / 100} ({m.count})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong>Impulse Candidates (recent, small purchases)</strong>
                      <ul>
                        {(data.local.impulseCandidates ?? []).map((t: TransactionData, i: number) => (
                          <li key={t.id ?? i}>
                            {new Date(t.date).toLocaleDateString()} — {t.merchant ?? t.payee ?? 'Unknown'} — ${t.amount ?? t.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {data.transactions && data.transactions.length > 0 && (
                  <div className="mt-4">
                    <strong>Recent transactions (sample):</strong>
                    <ul className="mt-2">
                      {data.transactions.slice(0, 10).map((t: TransactionData, i: number) => (
                        <li key={t.id ?? i} className="text-sm">
                          {new Date(t.date).toLocaleDateString()} — {t.merchant ?? t.payee ?? 'Unknown'} — ${t.amount ?? t.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter />
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
