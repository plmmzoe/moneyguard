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

async function getUserProfile(userid:string, supabase: SupabaseClient) : Promise<Tables<'profiles'> | undefined> {
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', userid).single();
  if (!error && profile) {
    return profile;
  }
  throw new Error('Unable to get user profiles');
}

async function getUserHistory(userid:string, supabase: SupabaseClient) : Promise<Tables<'transactions'>[] | undefined> {
  const { data: profile, error } = await supabase.from('transactions').select('*').eq('user_id', userid);
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
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
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
          setTransactions(history);
        }
      }).catch(_ => {
        console.error('failed to get user transaction history');
      });
    }
  }, [supabase, user]);
  return (
    <>
      <div className={'w-full h-full'}>
        <Header user={user}  />
        <div className={'p-10'}>
          Welcome Back, {profile.username}
          {(transactions.length === 0) ?

            <Card>
              <CardHeader>
                <CardTitle>
                  No Transaction History
                </CardTitle>
              </CardHeader>
            </Card>
            :
            <Card className={'grid grid-cols-2'}>
              <Card className={'border-transparent'}>
                <CardHeader>
                  <CardTitle>
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent >
                  <PlotFigure
                    options={{
                      width: 600,
                      height: 300,
                      marks: [
                        Plot.line(transactions, { x: 'amount', y: 'amount', curve: 'catmull-rom' }),
                        Plot.dot(transactions, { x: 'amount', y: 'amount' }),
                      ],
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  {transactions.map((transaction) => {
                    return <Card className={'grid grid-cols-2'} key={transaction.transaction_id}>
                      <CardHeader>
                        <CardTitle>
                          {transaction.transaction_description}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {transaction.amount}
                      </CardContent>
                    </Card>;
                  })}
                </CardContent>
              </Card>
            </Card>
          }
          <div className={'grid grid-cols-2 '}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Monthly Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.monthly_budget}
                {profile.currency}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  Monthly Irregular Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.monthly_irregular_spending}
                {profile.currency}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
              Savings Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.savings_goal_amount}
              {profile.currency}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
}
