export type Item = {
  name: string,
  price:number,
  quantity:number,
}

export type LlmResponse = {
  items: Item[],
  analysis: string,
}
