'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { TransactionData, deleteTransactions, getTransactions, postTransaction } from '@/app/dashboard/actions';
import { AppLayout } from '@/components/app-layout';
import { calcuateTimeProgress } from '@/components/dashboard/widgets/cool-off-status-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useProfileInfo } from '@/hooks/useProfileInfo';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';

const PAGE_CNT = 15;

export default function HistoryPage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [open, setOpen] = useState(false);
  const [pageNum, setPageNum] = useState<number>(1);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const { toast } = useToast();

  const refreshTransactions = useCallback(() => {
    getTransactions()
      .then((t) => {
        if (t) {
          setTransactions(t);
          setPageNum(1);
        }
      })
      .catch(() => {
        toast({ description: 'Failed to load transactions.', variant: 'destructive' });
      });
  }, [toast]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  async function handleDeleteRow(transaction: Tables<'transactions'>) {
    try {
      await deleteTransactions(transaction);
      setTransactions((prev) => prev.filter((t) => t.transaction_id !== transaction.transaction_id));
      toast({ description: 'Transaction deleted.' });
    } catch {
      toast({ description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  }
  function incrementPageNum() {

    if (transactions.length > pageNum * PAGE_CNT) {
      setPageNum(pageNum + 1);
    }
  }
  function decresePageNum() {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="w-full max-w-4xl mx-auto rounded-xl bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your history.</p>
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
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">History</h1>
          <Button size="sm" className="shrink-0" onClick={() => setOpen(true)}>
            Log impulse purchase
          </Button>
        </div>
        {transactions.length > 0 && (
          <>
            <div className={'grid grid-cols-2 w-full m-0 p-0'}>
              <p className={'text-xs m-0 p-0'}>Showing {Math.min(transactions.length, PAGE_CNT * pageNum)} / {transactions.length}</p>
              <div className={'ml-auto text-xl'}>
                <button onClick={(_) => decresePageNum()}> <ArrowLeft /> </button>
                <button className={'ml-2'} onClick={(_) => incrementPageNum()}> <ArrowRight /> </button>
              </div>
            </div>
            <Card className="mt-4 bg-card border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-muted/60 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Product
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Date
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Amount
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      AI Verdict
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide text-right">
                      Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.slice(
                      (pageNum - 1) * PAGE_CNT,
                      Math.min(
                        transactions.length - ((pageNum - 1) * PAGE_CNT),
                        PAGE_CNT) + (pageNum - 1) * PAGE_CNT).map((t) => {
                      const statusLower = (t.transaction_state ?? '').toLowerCase();
                      const statusClasses =
                      statusLower === 'bought'
                        ? 'bg-primary/10 text-primary'
                        : statusLower === 'discarded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : statusLower === 'waiting'
                            ? 'bg-blue-100 text-blue-500'
                            : '';

                      return (
                        <tr key={t.transaction_id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-foreground line-clamp-2">{t.transaction_description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-foreground whitespace-nowrap">
                            {`$${t.amount.toFixed(2)}`}
                          </td>
                          <td className="px-4 py-3">
                            {t.verdict ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-muted text-foreground">
                                {t.verdict}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {t.transaction_state ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusClasses}`}
                              >
                                <span className="size-1.5 rounded-full bg-current" />
                                {t.transaction_state === 'waiting' && t.cooloff_expiry
                                  ? (`Cooloff: ${calcuateTimeProgress(new Date().toISOString(), new Date(t.cooloff_expiry).toISOString()).timeLeft  } left`)
                                  : (t.transaction_state)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
                              onClick={() => handleDeleteRow(t)}
                            >
                            Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
      {open && (
        <LogImpulseOverlay
          onClose={() => setOpen(false)}
          onSaved={refreshTransactions}
        />
      )}
    </AppLayout>
  );
}

function LogImpulseOverlay({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const supabase = createClient();
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('CAD');
  const [category, setCategory] = useState('');
  const [emotion, setEmotion] = useState('excited');
  const [trigger, setTrigger] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  const [saving, setSaving] = useState(false);
  const { profile } = useProfileInfo(supabase);

  const emotions: { id: string; label: string; icon: string }[] = [
    { id: 'bored', label: 'Bored', icon: '😐' },
    { id: 'stressed', label: 'Stressed', icon: '⚡' },
    { id: 'excited', label: 'Excited', icon: '🎉' },
    { id: 'social', label: 'Social', icon: '🧑‍🤝‍🧑' },
    { id: 'tired', label: 'Tired', icon: '😴' },
    { id: 'other', label: 'Other', icon: '➕' },
  ];

  async function handleSave() {
    if (!productName.trim()) {
      toast({ description: 'Please enter a product name.', variant: 'destructive' });
      return;
    }
    if (!amount || amount <= 0) {
      toast({ description: 'Please enter an amount greater than 0.', variant: 'destructive' });
      return;
    }
    if (!category) {
      toast({ description: 'Please select a category.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const createdAt = date ? new Date(date) : new Date();
      const status = 'bought';
      const verdict = null;
      const data: TransactionData = {
        associated_savings: profile?.active_saving ?? null,
        analysis: null,
        cooloff_expiry: null,
        transaction_state: status,
        verdict,
        amount,
        created_at: createdAt.toISOString(),
        transaction_description: productName.trim(),
      };

      await postTransaction(data);
      toast({ description: 'Impulse purchase logged.' });
      onSaved();
      onClose();
    } catch {
      toast({ description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <Card className="relative z-50 w-full max-w-[640px] max-h-[75vh] flex flex-col bg-card border-border overflow-hidden">
        <div className="shrink-0 p-6 md:p-8 pb-0 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Log an Impulse Purchase</h2>
          <p className="text-sm text-muted-foreground">
            Take a breath. Awareness is the first step to intentional saving.
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 pt-4 space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="product" className="text-sm font-semibold">
            Product name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="product"
              type="text"
              className="h-11 text-base"
              placeholder="e.g. Sony WH-1000XM5"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount" className="text-sm font-semibold">
              Amount <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[90px] h-11 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-11 text-base flex-1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Category <span className="text-red-500">*</span></Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dining & Drinks">Dining & Drinks</SelectItem>
                  <SelectItem value="Tech & Gadgets">Tech & Gadgets</SelectItem>
                  <SelectItem value="Fashion & Apparel">Fashion & Apparel</SelectItem>
                  <SelectItem value="Home Decor">Home Decor</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">How were you feeling?</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {emotions.map((e) => {
                const active = e.id === emotion;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEmotion(e.id)}
                    className={`emotion-btn flex flex-col items-center gap-1.5 p-2 border rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className={`text-lg ${active ? 'text-primary' : 'text-muted-foreground'}`}>{e.icon}</span>
                    <span>{e.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">What triggered this purchase?</Label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="e.g., saw an Instagram ad, long day, peer pressure..."
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 py-2 text-xs text-muted-foreground">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-semibold">Date &amp; time</Label>
              <Input
                type="datetime-local"
                className="h-9 text-xs max-w-[220px]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full h-11 gap-2"
              disabled={saving}
              onClick={handleSave}
            >
            Save record
            </Button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="self-center text-xs font-medium text-muted-foreground"
            >
            Cancel &amp; discard
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm leading-relaxed">
            <span className="mt-0.5 text-primary">💡</span>
            <p className="text-foreground">
              <strong className="text-primary">Pro tip:</strong> By logging this now, you&apos;re building a habit of
            reflection. Simply noticing your triggers can meaningfully reduce impulse spending over time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
