export type Item = {
  name: string,
  price:number,
  quantity:number,
}

/** Aligned with unified analysis response: verdict, analysis, impulseScore, summary. */
export type LlmResponse = {
  items: Item[],
  analysis: string,
  verdict?: Verdict,
  impulseScore?: number,
  summary?: string,
  transaction_state?: 'draft' | 'waiting' | 'discarded' | 'bought',
}

export type MsgRequest = {
  type: RequestTypes,
  [key:string]:any,
}

export type MsgResp = {
  success: boolean,
  [key:string]:any,
}

export type Verdict = 'high' | 'medium' | 'low';

export type TransactionState = 'draft' | 'waiting' | 'discarded' | 'bought';

export type RequestTypes = "OPEN_ANALYSIS" | "ADD_TRANSACTION" | "UPDATE_SAVINGS" | "GET_PROFILE" | "GET_USER" | "PREV_TAB"|"UPDATE_TRANSACTION_STATE";

export type TransactionDetails = {
  amount: number
  analysis?: string | null
  associated_savings?: number | null
  cooloff_expiry?: string | null
  created_at?: string
  transaction_description: string
  transaction_id?: string
  transaction_state?: TransactionState | null
  user_id: string
  verdict?: Verdict | null
}