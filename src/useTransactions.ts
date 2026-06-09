import { useCallback, useEffect, useMemo, useState } from 'react'
import { computeTotals } from './lib/ledgerMath'
import { STORAGE_KEY, loadTransactionsFromStorage } from './lib/transactionsStorage'
import type { Transaction, TransactionKind } from './types'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    typeof window === 'undefined'
      ? []
      : loadTransactionsFromStorage((key) => localStorage.getItem(key)),
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

  const totals = useMemo(() => computeTotals(transactions), [transactions])

  return { transactions, add, remove, clearAll, totals }
}
