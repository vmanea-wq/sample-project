import type { Transaction } from '../types'

const STORAGE_KEY = 'money-manager:transactions'

export { STORAGE_KEY }

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    (v.kind === 'income' || v.kind === 'expense') &&
    typeof v.amount === 'number' &&
    Number.isFinite(v.amount) &&
    typeof v.label === 'string' &&
    typeof v.createdAt === 'string'
  )
}

export function parseStoredTransactions(raw: string | null): Transaction[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTransaction)
  } catch {
    return []
  }
}

export function loadTransactionsFromStorage(
  getItem: (key: string) => string | null,
): Transaction[] {
  return parseStoredTransactions(getItem(STORAGE_KEY))
}
