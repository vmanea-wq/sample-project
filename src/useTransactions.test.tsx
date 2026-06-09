import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from './lib/transactionsStorage'
import { useTransactions } from './useTransactions'

let store: Record<string, string>

function mockLocalStorage() {
  store = {}
  const ls = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      store = {}
    },
    key: () => null,
    get length() {
      return Object.keys(store).length
    },
  }
  vi.stubGlobal('localStorage', ls as Storage)
}

describe('useTransactions', () => {
  beforeEach(() => {
    mockLocalStorage()
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'uuid-fixed-1'),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts empty when storage empty', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.transactions).toEqual([])
    expect(result.current.totals.balance).toBe(0)
  })

  it('adds expense and updates totals', () => {
    const { result } = renderHook(() => useTransactions())
    act(() => {
      result.current.add('expense', 12.5, 'coffee')
    })
    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.totals.expense).toBe(12.5)
    expect(result.current.totals.balance).toBe(-12.5)
  })

  it('ignores invalid add', () => {
    const { result } = renderHook(() => useTransactions())
    act(() => {
      result.current.add('expense', 0, 'x')
      result.current.add('income', -1, 'x')
      result.current.add('income', 10, '   ')
    })
    expect(result.current.transactions).toHaveLength(0)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useTransactions())
    act(() => {
      result.current.add('income', 100, 'pay')
    })
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })

  it('remove and clearAll', () => {
    const { result } = renderHook(() => useTransactions())
    act(() => {
      result.current.add('income', 5, 'a')
    })
    const id = result.current.transactions[0]!.id
    act(() => {
      result.current.remove(id)
    })
    expect(result.current.transactions).toHaveLength(0)
    act(() => {
      result.current.add('expense', 1, 'b')
      result.current.clearAll()
    })
    expect(result.current.transactions).toHaveLength(0)
  })
})
