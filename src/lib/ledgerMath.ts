import type { Transaction } from '../types'

export function computeTotals(transactions: readonly Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.kind === 'income') income += t.amount
    else expense += t.amount
  }
  income = Math.round(income * 100) / 100
  expense = Math.round(expense * 100) / 100
  return {
    income,
    expense,
    balance: Math.round((income - expense) * 100) / 100,
  }
}
