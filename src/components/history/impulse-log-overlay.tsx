'use client';

import { useState } from 'react';

import { TransactionData, postTransaction } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function ImpulseLogOverlay({ onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('CAD');
  const [category, setCategory] = useState('');
  const [emotion, setEmotion] = useState('excited');
  const [trigger, setTrigger] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  const [saving, setSaving] = useState(false);

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
      const status = 'Bought';
      const verdict = '';
      const descParts = [
        `Product: ${productName.trim()}`,
        category ? `Category: ${category} (${currency})` : '',
        emotion ? `feeling: ${emotion}` : '',
        trigger ? `trigger: ${trigger}` : '',
        verdict ? `AI Verdict: ${verdict}` : '',
        status ? `Status: ${status}` : '',
      ].filter(Boolean);

      const data: TransactionData = {
        amount,
        created_at: createdAt.toISOString(),
        transaction_description: descParts.join(' | '),
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
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <Card className="relative z-50 w-full max-w-[640px] p-6 md:p-8 bg-card border-border space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Log an Impulse Purchase</h2>
          <p className="text-sm text-muted-foreground">
            Take a breath. Awareness is the first step to intentional saving.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product" className="text-sm font-semibold">
            Product name
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
              Amount
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
            <Label className="text-sm font-semibold">Category</Label>
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
      </Card>
    </div>
  );
}
