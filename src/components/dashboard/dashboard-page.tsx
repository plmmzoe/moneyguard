'use client';

import { useEffect, useState } from 'react';

import { getProfile, getTransactions } from '@/app/dashboard/actions';
import { BudgetCard, IrrSpdCard, SavingsCard, TransactionCard } from '@/components/dashboard/cards/transaction-card';
import { Footer } from '@/components/home/footer/footer';
import Header from '@/components/home/header/header';
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
  }, [supabase, user]);
  return (
    <>
      <div className={'h-full w-full'}>
        <Header user={user}  />
        <div className={'p-10 max-w-7xl m-auto'}>
          <p className={'font-bold text-3xl'}>
            {(profile) ?
              <p>Welcome Back, {profile.username}</p>
              : <p>No profile detected</p>
            }
          </p>
          <TransactionCard transactions={transactions}/>
          <div className={'grid grid-cols-3 '}>
            {profile ?
              <>
                <BudgetCard totalSpending={totalSpending} profile={profile}/>
                <IrrSpdCard profile={profile} spending={totalSpending}/>
                <SavingsCard profile={profile} totalSpending={totalSpending}/>
              </>
              : <p>no profile detected</p>
            }
          </div>
        </div>
      </div>
    </>
  );
}
