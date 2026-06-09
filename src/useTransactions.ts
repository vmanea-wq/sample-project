import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionKind } from './types'

const STORAGE_KEY = 'money-manager:transactions'

function loadFromStorage(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTransaction)
  } catch {
    return []
  }
}

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

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    typeof window === 'undefined' ? [] : loadFromStorage(),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const add = useCallback(
    (kind: TransactionKind, amount: number, label: string) => {
      const trimmed = label.trim()
      if (!trimmed || amount <= 0 || !Number.isFinite(amount)) return
      const tx: Transaction = {
        id: crypto.randomUUID(),
        kind,
        amount: Math.round(amount * 100) / 100,
        label: trimmed,
        createdAt: new Date().toISOString(),
      }
      setTransactions((prev) => [tx, ...prev])
    },
    [],
  )

  const remove = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setTransactions([])
  }, [])

  const totals = useMemo(() => {
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
  }, [transactions])

  return { transactions, add, remove, clearAll, totals }
}
