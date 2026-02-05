export type Item = {
  name: string,
  price:number,
  quantity:number,
}

export type LlmResponse = {
  items: Item[],
  analysis: string,
}

export type MsgRequest = {
  type: string,
  [key:string]:any,
}

export type MsgResp = {
  success: boolean,
  [key:string]:any,
}

export const requestTypes = {
  openAnalysis:"OPEN_ANALYSIS",
  addTransaction:"ADD_TRANSACTION",
  updateSaving:"UPDATE_SAVINGS",
  getProfile:"GET_PROFILE",
  getUser:"GET_USER",
}