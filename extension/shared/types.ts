export type Item = {
  name: string,
  price:number,
  quantity:number,
}

/** Aligned with unified analysis response: verdict, analysis, impulseScore, summary. */
export type LlmResponse = {
  items: Item[],
  analysis: string,
  verdict?: 'high' | 'medium' | 'low',
  impulseScore?: number,
  summary?: string,
  transaction_state?: 'draft' | 'waiting' | 'discarded' | 'bought',
}

export type MsgRequest = {
  type: string,
  [key:string]:any,
}

export type TransactionState = 'draft' | 'waiting' | 'discarded' | 'bought';

export const requestTypes = {
  openAnalysis: "OPEN_ANALYSIS",
  addTransaction: "ADD_TRANSACTION",
  updateSaving: "UPDATE_SAVINGS",
  getProfile: "GET_PROFILE",
  getUser: "GET_USER",
  prevTab: "PREV_TAB",
  createAnalysisTransaction: "CREATE_ANALYSIS_TRANSACTION",
  updateTransactionState: "UPDATE_TRANSACTION_STATE",
}