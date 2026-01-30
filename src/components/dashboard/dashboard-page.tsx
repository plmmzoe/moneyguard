'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { BudgetCard, IrrSpdCard, SavingsCard, TransactionCard } from '@/components/dashboard/cards/transaction-card';
import { Footer } from '@/components/home/footer/footer';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';
import '../../styles/home-page.css';

async function getUserProfile(userid:string, supabase: SupabaseClient) : Promise<Tables<'profiles'> | undefined> {
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', userid).single();
  if (!error && profile) {
    return profile;
  }
  throw new Error('Unable to get user profiles');
}

async function getUserHistory(userid:string, supabase: SupabaseClient) : Promise<Tables<'transactions'>[] | undefined> {
  const today = new Date();
  const dayInMs = 86400000;
  const past = new Date(today.getTime() - dayInMs * 7);
  const { data: profile, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userid)
    .gte('created_at', past.toISOString())
    .order('created_at', { ascending: true });
  if (!error && profile) {
    return profile;
  }
  throw new Error('Unable to get user transactions');
}

export function DashboardPage() {
  const [profile, setProfile] = useState<Tables<'profiles'>>({
    created_at: null,
    currency: null,
    monthly_budget: null,
    monthly_irregular_spending: null,
    savings_goal_amount: null,
    savings_goal_reward: null,
    updated_at: null,
    user_id: '',
    username: null,
  });
  const [transactions, setTransactions] = useState<TransactionDated[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  useEffect(() => {
    if (user) {
      getUserProfile(user.id, supabase).then(profile => {
        if (profile && profile?.username) {
          setProfile(profile);
        }
      }).catch(_ => {
      });
      getUserHistory(user.id, supabase).then(history => {
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
      }).catch(_ => {
        console.error('failed to get user transaction history');
      });
    }
  }, [supabase, user]);
  return (
    <>
      <div className={'h-full w-full'}>
        <Header user={user}  />
        <div className={'p-10 max-w-7xl m-auto'}>
          Welcome Back, {profile.username}
          <TransactionCard transactions={transactions}/>
          <div className={'grid grid-cols-3 '}>
            <BudgetCard totalSpending={totalSpending} profile={profile}/>
            <IrrSpdCard profile={profile}/>
            <SavingsCard profile={profile} totalSpending={totalSpending}/>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
