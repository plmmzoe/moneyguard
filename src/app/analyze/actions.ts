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

  const { error } = await supabase.from('analyses').insert({
    user_id: user.id,
    item_name: data.itemName,
    price: data.price,
    description: data.description,
    ai_analysis: data.aiAnalysis,
  });

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}
