import BGBlur from '@/components/ui/bg-blur-toggle';
import { Card } from '@/components/ui/card';
import { TransactionForm } from '@/components/upload/transaction-form';

export default function UploadCard({ refresh, toggle }:{ refresh: (x:void) => void, toggle: (x:void) => void }) {
  return (
    <div className={'w-full h-full fixed top-0 left-0'}>
      <BGBlur toggle={toggle}/>
      <Card className={'max-w-2xl fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2'}>
        <TransactionForm refresh={refresh} toggle={toggle}/>
      </Card>
    </div>
  );
}
