import { describe, expect, it } from 'vitest'
import { computeTotals } from './ledgerMath'
import type { Transaction } from '../types'

function tx(
  partial: Pick<Transaction, 'kind' | 'amount'> & Partial<Omit<Transaction, 'kind' | 'amount'>>,
): Transaction {
  return {
    id: partial.id ?? '1',
    kind: partial.kind,
    amount: partial.amount,
    label: partial.label ?? 'x',
    createdAt: partial.createdAt ?? '2020-01-01T00:00:00.000Z',
  }
}

describe('computeTotals', () => {
  it('returns zeros for empty list', () => {
    expect(computeTotals([])).toEqual({ income: 0, expense: 0, balance: 0 })
  })

  it('sums income and expenses', () => {
    const rows = [
      tx({ kind: 'income', amount: 100 }),
      tx({ kind: 'expense', amount: 40 }),
      tx({ kind: 'expense', amount: 10.5 }),
    ]
    expect(computeTotals(rows)).toEqual({
      income: 100,
      expense: 50.5,
      balance: 49.5,
    })
  })
})
