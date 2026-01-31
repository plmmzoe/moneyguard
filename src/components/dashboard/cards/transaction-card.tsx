
import '../../../styles/home-page.css';
import * as Plot from '@observablehq/plot';

import PlotFigure from '@/components/plot/plot-figure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingBar from '@/components/ui/loading-bar';
import { TransactionDated } from '@/lib/dashboard.type';
import { Tables } from '@/lib/database.types';

const TransactionCard = ({ transactions }:{transactions:TransactionDated[]}) => {
  return(<>

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
          <div className={'overflow-y-auto overflow-x-hidden h-[300px]'}>
            {transactions.map((transaction) => {
              return <TransactionElem transaction={transaction} key={transaction.transaction_id}/>;
            })}
          </div>
        </CardContent>
      </Card>
    </Card>
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
        <div className={'m-auto w-full pt-6'}>
          {(profile.monthly_budget && totalSpending / profile.monthly_budget < 1) ?
            <LoadingBar percent={100 * (totalSpending / profile.monthly_budget)}/>
            : <LoadingBar percent={100}/>
          }
        </div>
      </CardContent>
    </Card>
  );
};

const IrrSpdCard = ({ profile, spending }:{profile: Tables<'profiles'>, spending:number}) => {
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
              / profile.monthly_irregular_spending) * 100}/>
            : <LoadingBar percent={100}/>
          }
        </div>
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
            {(profile.monthly_budget) ?
              Math.max(profile.monthly_budget - totalSpending, 0)
              : 0}$ /
            {profile.savings_goal_amount}$
          </p>
          <div className={'m-auto w-full pt-6'}>
            {(profile.savings_goal_amount &&
              totalSpending / profile.savings_goal_amount < 1) ?
              <LoadingBar percent={(Math.max(totalSpending, 0)
                / profile.savings_goal_amount) * 100}/>
              : <LoadingBar percent={100}/>
            }
          </div>
          <div>
            {profile && profile.savings_goal_target_date ?
              <p>Expires at {new Date(profile.savings_goal_target_date).toLocaleDateString()}</p>
              : <p/>
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
