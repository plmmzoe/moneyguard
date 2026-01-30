'use client';

import * as Plot from '@observablehq/plot';
import { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/home/footer/footer';
import Header from '@/components/home/header/header';
import PlotFigure from '@/components/plot/plot-figure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Tables } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/client';

import '../../styles/home-page.css';

interface TransactionDated extends Tables<'transactions'> {
  date: Date | null;
}

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
          {(transactions.length === 0) ?

            <Card>
              <CardHeader>
                <CardTitle>
                  <p className={'font-bold text-xl'}>No Transaction History</p>
                </CardTitle>
              </CardHeader>
            </Card>
            :
            <Card className={'grid grid-cols-2 m-auto'}>
              <Card className={'border-transparent'}>
                <CardHeader>
                  <CardTitle>
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className={'min-w-[400px]'}>
                  <PlotFigure
                    options={{
                      width: 600,
                      height: 270,
                      marks: [
                        Plot.axisX({ ticks: '12 hours' }),
                        Plot.line(transactions, { x: 'date', y: 'amount', curve: 'linear' }),
                        Plot.dot(transactions, { x: 'date', y: 'amount' }),
                      ],
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className={'grid grid-cols-3 ml-4 mt-4'}>
                    <p>Description</p>
                    <p>Amount</p>
                    <p>Time created</p>
                  </div>
                  <div className={'overflow-y-auto overflow-x-hidden h-[300px]'}>
                    {transactions.map((transaction) => {
                      return <Card className={'grid grid-cols-3 m-1 border-0 border-b-1 rounded-b-none p-3'} key={transaction.transaction_id}>
                        <CardContent className={'flex items-center h-full w-full p-0'}>
                          {transaction.transaction_description}
                        </CardContent>
                        <CardContent className={'flex items-center h-full w-full p-0'}>
                          {transaction.amount}
                        </CardContent>
                        <CardContent className={'flex items-center h-full w-full p-0'}>
                          {transaction.date?.toDateString()}
                        </CardContent>
                      </Card>;
                    })}
                  </div>
                </CardContent>
              </Card>
            </Card>
          }
          <div className={'grid grid-cols-3 '}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Monthly Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={'font-bold text-4xl'}>
                  {totalSpending}$ /
                  {profile.monthly_budget}$
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  Monthly Irregular Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={'font-bold text-4xl'}>
                  {profile.monthly_irregular_spending}$
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  Savings Goal
                </CardTitle>
              </CardHeader>
              { profile.savings_goal_amount ?
                <CardContent>
                  <p className={'font-bold text-4xl'}>
                    {profile.savings_goal_amount - totalSpending}$ /
                    {profile.savings_goal_amount}$
                  </p>
                </CardContent>
                :
                <CardContent>
                  no saving goals set up yet
                </CardContent>
              }
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
