import { Item } from '@/lib/api.types';
import { TransactionData } from '@/lib/dashboard.type';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const { params }:{ params:{items:Item[], save:boolean}} = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('user retrieval error');
  }
  const current = new Date();
  if (params.save) {
    const dbItems: TransactionData[] = params.items.map((item): TransactionData => {
      return {
        amount: item.price * item.quantity,
        created_at: current.toISOString(),
        transaction_description: item.name,
        user_id: user.id,
      };
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbItems]);
    if (error) {
      throw new Error(`Error posting transaction: ${error.message}`);
    }
  }else{
    let savings = 0;
    for (const item of params.items) {
      savings += item.price * item.quantity;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .rpc('increment', { x: savings, row_id: user.id });
    if (error) {
      throw new Error(`Error posting transaction: ${error.message}`);
    }
  }
}
