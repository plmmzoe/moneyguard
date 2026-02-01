'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getAnalyses, getProfile, getTransactions } from '@/app/dashboard/actions';
import { BudgetCard, IrrSpdCard, SavingsCard, TransactionCard } from '@/components/dashboard/cards/transaction-card';
import Header from '@/components/home/header/header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserInfo } from '@/hooks/useUserInfo';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';
import '../../styles/home-page.css';

export function DashboardPage() {
  const [profile, setProfile] = useState<Tables<'profiles'>>();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionDated[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  useEffect(() => {
    if (user) {
      getProfile().then(profile => {
        if (profile && profile?.username) {
          setProfile(profile);
        }
      }).catch(error => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'User profile fetch failed',
          variant: 'destructive',
        });
        console.error('failed to get user profile');
      });
      getTransactions().then(history => {
        if (history) {
          let total = 0;
          const historyDated = history.map((h) => {
            const hDated = h as TransactionDated;
            hDated.date = new Date(h.created_at);
            if (h.amount) {
              total += h.amount;
            }
            return hDated;
          });
          setTotalSpending(total);
          setTransactions(historyDated);
        }
      }).catch(error => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'User history fetch failed',
          variant: 'destructive',
        });
        console.error('failed to get user transaction history');
      });
    }
  }, [supabase, user, toast]);
  return (
    <>
      <div className={'h-full w-full'}>
        <Header user={user} />
        <div className={'p-10 max-w-7xl m-auto'}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">
              {(profile) ?
                `Welcome Back, ${profile.username}`
                : 'No profile detected'
              }
            </h1>
            <Button asChild>
              <Link href="/analyze">Create New Analysis</Link>
            </Button>
          </div>
          <TransactionCard transactions={transactions} />
          <div className={'grid grid-cols-3 '}>
            {profile ?
              <>
                <BudgetCard totalSpending={totalSpending} profile={profile} />
                <IrrSpdCard profile={profile} spending={totalSpending} />
                <SavingsCard profile={profile} totalSpending={totalSpending} />
              </>
              : <p>no profile detected</p>
            }
          </div>

          <RecentAnalyses />
        </div>
      </div >
    </>
  );
}

function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Tables<'analyses'>[]>([]);

  useEffect(() => {
    getAnalyses().then(setAnalyses);
  }, []);

  if (analyses.length === 0) {return null;}

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Impulse Analysis</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{analysis.item_name}</h3>
              <span className="text-sm text-muted-foreground">${analysis.price}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{analysis.ai_analysis}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
