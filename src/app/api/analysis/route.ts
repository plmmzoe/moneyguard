import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { createClient as createSupabaseClient } from '@/utils/supabase/server';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

interface Transaction {
  id?: string;
  date: string;
  merchant?: string;
  payee?: string;
  amount?: number;
  price?: number;
}

interface MerchantSummary {
  merchant: string;
  total: number;
  count: number;
}

interface AnalysisResult {
  summary: { total: number; count: number; avg: number };
  topMerchants: MerchantSummary[];
  impulseCandidates: Transaction[];
}

function periodToRange(period: string | null) {
  const end = new Date();
  const start = new Date(end);

  switch (period) {
    case 'day':
      start.setDate(end.getDate() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      // default to month
      start.setMonth(end.getMonth() - 1);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function simpleLocalAnalysis(transactions: Transaction[]): AnalysisResult {
  const total = transactions.reduce((s, t) => s + (Number(t.amount ?? t.price ?? 0) || 0), 0);
  const count = transactions.length;
  const avg = count ? total / count : 0;

  const byMerchant = new Map<string, MerchantSummary>();
  for (const t of transactions) {
    const m = String(t.merchant ?? t.payee ?? 'Unknown');
    const amt = Number(t.amount ?? t.price ?? 0) || 0;
    const cur = byMerchant.get(m) ?? { merchant: m, total: 0, count: 0 };
    cur.total += amt;
    cur.count += 1;
    byMerchant.set(m, cur);
  }

  const topMerchants = Array.from(byMerchant.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  // Impulse candidates: recent small purchases (<= 100) sorted by date desc
  const impulseCandidates = transactions
    .filter((t: Transaction) => (Number(t.amount ?? t.price ?? 0) || 0) <= 100)
    .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    summary: { total, count, avg },
    topMerchants,
    impulseCandidates,
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseClient();

    const url = new URL(request.url);
    const period = url.searchParams.get('period');
    const { start, end } = periodToRange(period);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('transaction_description, amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transactions = data ?? [];
    if (transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions found for the specified period.' }, { status: 404 });
    }

    // If GEMINI key present, send a prompt for higher-level analysis.
    if (GEMINI_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Analyze the following user's transactions between ${start} and ${end}. Utilize the transactions' description, amount, and created_at date to identify spending trends, likely impulse purchases, and to suggest three actionable recommendations to help correct any irregular spending habits found in the analysis. Return JSON with keys: summary, impulseCandidates, recommendations. Return your response in a single key value pair in your json response such as { response: "Your entire written response here of multiple paragraphs, include any newline special characters to separate paragraphs" }. Transactions: ${JSON.stringify(
          transactions.slice(0, 200),
        )}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const accumulated = response.text();

        // Try to parse JSON from the streamed output
        try {
          const parsed = JSON.parse(accumulated);
          return NextResponse.json({ source: 'gemini', response: parsed.response });
        } catch {
          console.error('Failed to parse Gemini response as JSON');
          return NextResponse.json({ source: 'gemini-raw', response: accumulated });
        }
      } catch (err) {
        console.error('Gemini call failed:', err);
        const local = simpleLocalAnalysis(transactions);
        return NextResponse.json({ source: 'local', local });
      }
    }

    // No Gemini key: return local summary analysis
    const local = simpleLocalAnalysis(transactions);
    return NextResponse.json({ source: 'local', local, transactions });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
