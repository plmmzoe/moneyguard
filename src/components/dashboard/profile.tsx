'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { deleteTransactions, getProfile, getTransactions } from '@/app/dashboard/actions';
import { BudgetCard, IrrSpdCard, SavingsCard, TransactionCard } from '@/components/dashboard/cards/transaction-card';
import UploadCard from '@/components/dashboard/cards/upload-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUserInfo } from '@/hooks/useUserInfo';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

import '../../styles/home-page.css';

export function Profile({ supabase }: {supabase:SupabaseClient|null}) {
  const [profile, setProfile] = useState<Tables<'profiles'>>();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionDated[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [upload, setUpload] = useState<boolean>(false);
  const [selected, setSelected] = useState<TransactionDated[]>([]);
  const { user } = useUserInfo(supabase);
  function toggle() {
    setUpload(!upload);
  }
  function onSelect(transaction:TransactionDated) {
    setSelected(transactions => [...transactions, transaction]);
  }
  function onDeselect(transaction:TransactionDated) {
    for (let i = 0; i < selected.length; i++) {
      if (selected[i].transaction_id === transaction.transaction_id) {
        setSelected(transactions => transactions.filter(t => t.transaction_id !== transaction.transaction_id));
        break;
      }
    }
  }
  function onDelete() {
    if (selected.length > 0) {
      const ids = selected.map(t => t.transaction_id);
      deleteTransactions(ids).then((_) => {
        setSelected([]);
        toast({ description: 'Transactions deleted' });
        updateTransactions();
      }).catch((_) => {
        toast({
          title: 'Error',
          description: 'Transaction deletion failed',
          variant: 'destructive',
        });
      });
    }else{
      toast({
        description: 'Please select a transaction to delete',
        variant: 'destructive',
      });
    }
  }
  function updateTransactions() {
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
      updateTransactions();
    }// eslint-disable-next-line
  }, [user]);
  return (
    <>
      <div className={'h-full w-full'}>
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
          <TransactionCard
            transactions={transactions}
            toggle={toggle}
            onSelect={onSelect}
            onDeselect={onDeselect}
            onDelete={onDelete}
          />
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
        </div>
        {(upload) ?
          <UploadCard refresh={updateTransactions} toggle={toggle}/>
          : <div />
        }
      </div >
    </>
  );
}
