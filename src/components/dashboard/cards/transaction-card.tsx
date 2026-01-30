
import '../../../styles/home-page.css';
import * as Plot from '@observablehq/plot';

import PlotFigure from '@/components/plot/plot-figure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

const TransactionCard = ({ transactions }:{transactions:TransactionDated[]}) => {
  return(<>
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
        <Card>
          <CardContent>
            <div className={'grid grid-cols-3 ml-4 mt-4'}>
              <p>Description</p>
              <p>Amount</p>
              <p>Time created</p>
            </div>
            <div className={'overflow-y-auto overflow-x-hidden h-[300px]'}>
              {transactions.map((transaction) => {
                return <TransactionElem transaction={transaction} key={transaction.transaction_id}/>;
              })}
            </div>
          </CardContent>
        </Card>
      </Card>
    }
  </>
  );
};

const TransactionElem = ({ transaction }:{transaction:TransactionDated}) => {
  return (
    <Card className={'grid grid-cols-3 m-1 border-0 border-b-1 rounded-b-none p-3'} key={transaction.transaction_id}>
      <CardContent className={'flex items-center h-full w-full p-0'}>
        {transaction.transaction_description}
      </CardContent>
      <CardContent className={'flex items-center h-full w-full p-0'}>
        {transaction.amount}
      </CardContent>
      <CardContent className={'flex items-center h-full w-full p-0'}>
        {transaction.date?.toDateString()}
      </CardContent>
    </Card>
  );
};

const BudgetCard = ({ totalSpending, profile }:{totalSpending:number, profile:Tables<'profiles'>}) => {
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
      </CardContent>
    </Card>
  );
};

const IrrSpdCard = ({ profile }:{profile: Tables<'profiles'>}) => {
  return (
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
  );
};

const SavingsCard = ({ profile, totalSpending }:{profile: Tables<'profiles'>, totalSpending: number}) => {
  return (
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
  );
};

export { TransactionCard, BudgetCard, IrrSpdCard, SavingsCard };
