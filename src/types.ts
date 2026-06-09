export type TransactionKind = 'income' | 'expense'

export type Transaction = {
  id: string
  kind: TransactionKind
  amount: number
  label: string
  createdAt: string
}
