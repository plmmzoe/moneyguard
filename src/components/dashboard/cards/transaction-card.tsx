
import '../../../styles/home-page.css';
import * as Plot from '@observablehq/plot';
import { CheckIcon } from '@radix-ui/react-icons';
import { Checkbox } from 'radix-ui';
import * as React from 'react';
import { useEffect } from 'react';

import PlotFigure from '@/components/plot/plot-figure';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingBar from '@/components/ui/loading-bar';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

const TransactionCard = (
  { transactions, onSelect, onDeselect, onDelete }:
  { transactions: TransactionDated[],
    onSelect: (x:TransactionDated) => void,
    onDeselect: (x:TransactionDated) => void,
    onDelete: (x:void) => void
  }) => {
  return (<>
    <Card className={'grid grid-cols-2 m-auto m-4'}>
      {(transactions.length === 0) ?
        <CardHeader>
          <CardTitle>
            <p className={'font-bold text-xl'}>No Transaction History</p>
          </CardTitle>
        </CardHeader>
        :
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
                height: 300,
                marks: [
                  Plot.axisX({ ticks: '12 hours' }),
                  Plot.line(transactions, { x: 'date', y: 'amount', curve: 'linear' }),
                  Plot.dot(transactions, { x: 'date', y: 'amount' }),
                ],
              }}
            />
          </CardContent>
        </Card>
      }

      <Card>
        <CardContent>
          <div className={'grid grid-cols-3 ml-4 mt-4'}>
            <p>Description</p>
            <p>Amount</p>
            <p>Time created</p>
          </div>
          <div className={'overflow-y-auto overflow-x-hidden h-[250px]'}>
            {transactions.map((transaction) => {
              return <TransactionElem
                transaction={transaction}
                key={transaction.transaction_id}
                onDeselect={onDeselect}
                onSelect={onSelect}
              />;
            })}
          </div>
          <div className={'grid grid-cols-4'}>
            <div className="col-span-3" />
            <Button className={'w-full mt-3 bg-red-600 ml-2'} onClick={(_) => onDelete()}>
              <p>Delete</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Card>
  </>
  );
};

const TransactionElem = (
  { transaction, onSelect, onDeselect }:
  { transaction: TransactionDated, onSelect:(x:TransactionDated)=>void, onDeselect:(x:TransactionDated)=>void }) => {
  const [checked, setChecked] = React.useState(false);
  const [bgColor, setBgColor] = React.useState('#020817');
  useEffect(() => {
    if (checked) {
      onSelect(transaction);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBgColor('#545454');
    } else {
      onDeselect(transaction);

      setBgColor('#020817');
    }// eslint-disable-next-line
  }, [checked]);
  return (
    <div>
      <Card className={'grid grid-cols-3 m-1 border-0 border-b-1 rounded-b-none rounded-none p-3'} key={transaction.transaction_id} style={{ backgroundColor: bgColor }} onClick={(_) => setChecked(!checked)}>
        <CardContent className={'flex items-center h-full w-full p-0'}>
          <Checkbox.Root
            className="mr-1 flex size-[20px] appearance-none items-center justify-center rounded border-white border-1 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px_black]"
            checked={checked}
          >
            <Checkbox.Indicator className="text-violet11">
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox.Root>
          {transaction.transaction_description}
        </CardContent>
        <CardContent className={'flex items-center h-full w-full p-0'}>
          {transaction.amount}
        </CardContent>
        <CardContent className={'flex items-center h-full w-full p-0'}>
          {transaction.date?.toDateString()}
        </CardContent>
      </Card>
    </div>
  );
};

const BudgetCard = ({ totalSpending, profile }: { totalSpending: number, profile: Tables<'profiles'> }) => {
  return (
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
        <div className={'m-auto w-full pt-6'}>
          {(profile.monthly_budget && totalSpending / profile.monthly_budget < 1) ?
            <LoadingBar percent={100 * (totalSpending / profile.monthly_budget)} />
            : <LoadingBar percent={100} />
          }
        </div>
      </CardContent>
    </Card>
  );
};

const IrrSpdCard = ({ profile, spending }: { profile: Tables<'profiles'>, spending: number }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Monthly Irregular Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={'font-bold text-4xl'}>
          {(profile.monthly_irregular_spending) ?
            spending : 0}$ /
          {profile.monthly_irregular_spending}$
        </p>
        <div className={'m-auto w-full pt-6'}>
          {(profile.monthly_irregular_spending &&
            spending / profile.monthly_irregular_spending < 1) ?
            <LoadingBar percent={(Math.max(spending, 0)
              / profile.monthly_irregular_spending) * 100} />
            : <LoadingBar percent={100} />
          }
        </div>
      </CardContent>
    </Card>
  );
};

const SavingsCard = ({ profile, saving }: { profile: Tables<'profiles'>, saving: number }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Savings Goal
        </CardTitle>
      </CardHeader>
      {profile.savings_goal_amount ?
        <CardContent>
          <p className={'font-bold text-4xl'}>
            {saving}$ /
            {profile.savings_goal_amount}$
          </p>
          <div className={'m-auto w-full pt-6'}>
            {(profile.savings_goal_amount &&
              saving / profile.savings_goal_amount < 1) ?
              <LoadingBar percent={(saving / profile.savings_goal_amount) * 100} />
              : <LoadingBar percent={100} />
            }
          </div>
          <div>
            {profile && profile.savings_goal_target_date ?
              <p>Expires at {new Date(profile.savings_goal_target_date).toLocaleDateString()}</p>
              : <p />
            }
          </div>
        </CardContent>
        :
        <CardContent>
          no saving goals set up yet
        </CardContent>
      }
    </Card>
  );
};

export { TransactionCard, BudgetCard, IrrSpdCard, SavingsCard };
