'use server';

import { createClient } from '@/utils/supabase/server';

export async function saveAnalysis(data: {
    itemName: string;
    price: number;
    description: string;
    aiAnalysis: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount: data.price,
    transaction_description: data.itemName,
    analysis: data.aiAnalysis,
  });

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}
