
import { useState } from 'react';

import { postTransaction, TransactionData } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function TransactionForm({ refresh, toggle }:{ refresh: (x:void) => void, toggle: (x:void) => void }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(0);
  const [transactionDesc, setTransactionDesc] = useState('');
  const [date, setDate] = useState<Date|null>(new Date());
  const [uploading, setUploading] = useState<boolean>(false);

  function handleSubmit() {
    if (date && date.getTime() < new Date().getTime()) {
      if (amount <= 0) {
        toast({ description: 'Please enter an amount that is greater than 0', variant: 'destructive' });
        return;
      }
      if (transactionDesc.length === 0) {
        toast({ description: 'Please enter description', variant: 'destructive' });
        return;
      }
      setUploading(true);
      const data: TransactionData = {
        amount,
        created_at: date.toISOString(),
        transaction_description: transactionDesc,
      };
      postTransaction(data).then((_) => {
        toast({ description: 'Transaction successfully created' });
        setUploading(false);
        refresh();
        toggle();
      }).catch((_) => {
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      });
    }else{
      toast({ description: 'Please enter a valid date', variant: 'destructive' });
    }
  }
  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Add a New Transaction</div>
      <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
        <Label className={'text-muted-foreground leading-5'} htmlFor="amount">
          Amount
        </Label>
        <Input
          className={'border-border rounded-xs'}
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className={'text-muted-foreground leading-5'} htmlFor="description">
          Description
        </Label>
        <Input
          className={'border-border rounded-xs'}
          type="text"
          id="description"
          value={transactionDesc}
          onChange={(e) => setTransactionDesc(e.target.value)}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className={'text-muted-foreground leading-5'} htmlFor="description">
          Description
        </Label>
        <Input
          className={'border-border rounded-xs'}
          type="date"
          id="description"
          value={date?.toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.valueAsDate)}
        />
      </div>
      {(!uploading) ?
        (<Button formAction={() => handleSubmit()} type={'submit'} variant={'secondary'} className={'w-full'}>
          Add Transaction
        </Button>)
        : <div />
      }
    </form>
  );
}
