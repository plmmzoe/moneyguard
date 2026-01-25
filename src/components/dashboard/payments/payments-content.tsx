'use client';

import { useEffect, useState } from 'react';

import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { columns } from '@/components/dashboard/payments/components/columns';
import { DataTable } from '@/components/dashboard/payments/components/data-table';
import { usePagination } from '@/hooks/usePagination';
import { TransactionResponse } from '@/lib/api.types';
import { getTransactions } from '@/utils/paddle/get-transactions';

interface Props {
  subscriptionId: string;
}

export function PaymentsContent({ subscriptionId }: Props) {
  const { after, goToNextPage, goToPrevPage, hasPrev } = usePagination();

  const [transactionResponse, setTransactionResponse] = useState<TransactionResponse>({
    data: [],
    hasMore: false,
    totalRecords: 0,
    error: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await getTransactions(subscriptionId, after);
      if (response) {
        setTransactionResponse(response);
      }
      setLoading(false);
    })();
  }, [subscriptionId, after]);

  if (!transactionResponse || transactionResponse.error) {
    return <ErrorContent />;
  } if (loading) {
    return <LoadingScreen />;
  }

  const { data: transactionData, hasMore, totalRecords } = transactionResponse;
  return (
    <div>
      <DataTable
        columns={columns}
        hasMore={hasMore}
        totalRecords={totalRecords}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
        hasPrev={hasPrev}
        data={transactionData ?? []}
      />
    </div>
  );
}
