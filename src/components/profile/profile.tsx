'use client';

import {
  CheckCircle,
  Info,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateProfile } from '@/app/profile/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { Tables } from '@/lib/database.types';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) {
    return null;
  }
  const d = new Date(createdAt);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Profile({
  profile,
  email,
}: {
  profile: Tables<'profiles'> | null;
  email?: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [monthlyBudget, setMonthlyBudget] = useState(
    profile?.monthly_budget != null ? String(profile.monthly_budget) : '',
  );
  const [currency, setCurrency] = useState(profile?.currency ?? 'USD');
  const [irregularBudget, setIrregularBudget] = useState(
    profile?.monthly_irregular_spending != null
      ? String(profile.monthly_irregular_spending)
      : '',
  );

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        username: username.trim() || (profile?.username ?? ''),
        monthly_budget: Number(monthlyBudget) || 0,
        currency,
        monthly_irregular_spending: irregularBudget ? Number(irregularBudget) : null,
      });
      toast({ description: 'Profile updated.' });
      router.refresh();
    } catch (e) {
      toast({
        description: e instanceof Error ? e.message : 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 w-full max-w-4xl mx-auto">
        <p className="text-muted-foreground">Sign in or complete your onboarding to view your profile.</p>
        <Link href="/onboarding" className="mt-4 inline-flex text-primary font-medium text-sm hover:underline">
          Complete setup
        </Link>
      </div>
    );
  }

  const memberSince = formatMemberSince(profile.created_at);
  const displayName = profile.username?.trim() || email?.split('@')[0] || 'Member';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-0">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="size-20 sm:size-24 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <span className="text-3xl sm:text-4xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground truncate">
              {displayName}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {email ?? '—'}
              {memberSince && ` • Member since ${memberSince}`}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Account Details */}
        <section className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input
                className="w-full rounded-lg border-border focus:ring-primary focus:border-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Email Address</Label>
              <Input
                className="w-full rounded-lg border-border bg-muted/50 cursor-not-allowed"
                type="email"
                value={email ?? ''}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">Email is managed by your account.</p>
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-bold text-foreground">Password Security</p>
                <p className="text-xs text-muted-foreground">Change or reset your password.</p>
              </div>
              <Link href="/auth/forgot-password">
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold shrink-0">
                  Reset Password
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Spending Preferences */}
        <section className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Spending Preferences
            </h3>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Helps AI reflections
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Monthly Target</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full pl-7 rounded-lg border-border focus:ring-primary focus:border-primary"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full rounded-lg border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Irregular Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full pl-7 rounded-lg border-border focus:ring-primary focus:border-primary"
                  value={irregularBudget}
                  onChange={(e) => setIrregularBudget(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save & Links */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 pb-8">
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Edit full profile
              </Button>
            </Link>
            <Link href="/savings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Edit goals
              </Button>
            </Link>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-8 py-3 bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 flex items-center gap-2 shrink-0"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
