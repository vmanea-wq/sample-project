import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/transactionsStorage'
import type { Transaction } from './types'

describe.sequential('App', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('crypto', {
      randomUUID: () => `id-${Math.random().toString(36).slice(2)}`,
    })
  })

  it('renders ledger heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /pocket ledger/i })).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('adds a transaction via form', async () => {
    const user = userEvent.setup()
    render(<App />)
    const amount = screen.getByTestId('input-amount')
    const label = screen.getByTestId('input-label')
    await user.click(amount)
    await user.clear(amount)
    await user.type(amount, '25')
    await user.click(label)
    await user.clear(label)
    await user.type(label, 'groceries')
    await user.click(screen.getByTestId('submit-add'))
    expect(await screen.findByTestId('transaction-list')).toBeInTheDocument()
    expect(screen.getByText('groceries')).toBeInTheDocument()
    expect(screen.getByTestId('expense-total')).toHaveTextContent(/\$25/)
  })

  it('deletes a row from the list', async () => {
    const user = userEvent.setup()
    const row: Transaction = {
      id: 'del-1',
      kind: 'expense',
      amount: 9,
      label: 'remove-me',
      createdAt: '2024-02-01T00:00:00.000Z',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([row]))
    render(<App />)
    await user.click(screen.getByRole('button', { name: /delete remove-me/i }))
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('toggles income and expense modes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('toggle-income'))
    expect(screen.getByTestId('toggle-income')).toHaveClass('active')
    await user.click(screen.getByTestId('toggle-expense'))
    expect(screen.getByTestId('toggle-expense')).toHaveClass('active')
  })

  it('shows persisted transactions on reload', () => {
    const row: Transaction = {
      id: 'seed-1',
      kind: 'income',
      amount: 50,
      label: 'seed',
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([row]))
    render(<App />)
    expect(screen.getByText('seed')).toBeInTheDocument()
    expect(screen.getByTestId('income-total')).toHaveTextContent(/\$50/)
  })

  it('clears all when confirmed', () => {
    const row: Transaction = {
      id: 'seed-2',
      kind: 'expense',
      amount: 2,
      label: 'x',
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([row]))
    window.confirm = vi.fn(() => true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})
