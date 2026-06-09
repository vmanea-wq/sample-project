import { describe, expect, it } from 'vitest'
import { parseStoredTransactions, STORAGE_KEY } from './transactionsStorage'
import type { Transaction } from '../types'

describe('parseStoredTransactions', () => {
  it('returns empty for null', () => {
    expect(parseStoredTransactions(null)).toEqual([])
  })

  it('parses valid JSON array', () => {
    const row: Transaction = {
      id: 'a',
      kind: 'income',
      amount: 5,
      label: 'pay',
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    expect(parseStoredTransactions(JSON.stringify([row]))).toEqual([row])
  })

  it('filters invalid entries', () => {
    const raw = JSON.stringify([
      { id: 'x', kind: 'income', amount: 1, label: 'ok', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 'bad' },
      'nope',
    ])
    expect(parseStoredTransactions(raw)).toHaveLength(1)
  })

  it('returns empty on malformed JSON', () => {
    expect(parseStoredTransactions('not json')).toEqual([])
  })

  it('exports storage key constant', () => {
    expect(STORAGE_KEY).toBe('money-manager:transactions')
  })
})
