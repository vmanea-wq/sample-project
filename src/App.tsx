import { type FormEvent, useState } from 'react'
import './App.css'
import { formatLedgerWhen } from './lib/formatLedgerWhen'
import type { TransactionKind } from './types'
import { useTransactions } from './useTransactions'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function App() {
  const { transactions, add, remove, clearAll, totals } = useTransactions()
  const [kind, setKind] = useState<TransactionKind>('expense')
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const n = Number.parseFloat(amount.replace(',', '.'))
    add(kind, n, label)
    setAmount('')
    setLabel('')
  }

  return (
    <div className="app" data-testid="app-root">
      <header className="header">
        <h1 className="title">Pocket Ledger</h1>
        <p className="tagline">Track income and spending in one place.</p>
      </header>

      <section className="summary" aria-label="Balance summary">
        <article className="summary-card balance">
          <span className="summary-label">Balance</span>
          <span
            className={`summary-value ${totals.balance >= 0 ? 'positive' : 'negative'}`}
            data-testid="balance-value"
          >
            {currency.format(totals.balance)}
          </span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Income</span>
          <span className="summary-value positive" data-testid="income-total">
            {currency.format(totals.income)}
          </span>
        </article>
        <article className="summary-card">
          <span className="summary-label">Expenses</span>
          <span className="summary-value negative" data-testid="expense-total">
            {currency.format(totals.expense)}
          </span>
        </article>
      </section>

      <form className="form" onSubmit={onSubmit}>
        <fieldset className="kind-toggle">
          <legend className="sr-only">Transaction type</legend>
          <button
            type="button"
            className={kind === 'income' ? 'active income' : ''}
            onClick={() => setKind('income')}
            data-testid="toggle-income"
          >
            Income
          </button>
          <button
            type="button"
            className={kind === 'expense' ? 'active expense' : ''}
            onClick={() => setKind('expense')}
            data-testid="toggle-expense"
          >
            Expense
          </button>
        </fieldset>
        <div className="fields">
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              inputMode="decimal"
              autoComplete="transaction-amount"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              data-testid="input-amount"
            />
          </label>
          <label className="field grow">
            <span>Description</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="Coffee, paycheck, rent…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={120}
              data-testid="input-label"
            />
          </label>
          <button type="submit" className="submit" data-testid="submit-add">
            Add
          </button>
        </div>
      </form>

      <section className="list-section">
        <div className="list-header">
          <h2>Recent activity</h2>
          {transactions.length > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                if (
                  window.confirm('Remove all transactions? This cannot be undone.')
                ) {
                  clearAll()
                }
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <p className="empty" data-testid="empty-state">
            No entries yet. Add your first income or expense above.
          </p>
        ) : (
          <ul className="transactions" data-testid="transaction-list">
            {transactions.map((t) => (
              <li key={t.id} className={`row ${t.kind}`}>
                <div className="row-main">
                  <span className="row-label">{t.label}</span>
                  <time dateTime={t.createdAt}>{formatLedgerWhen(t.createdAt)}</time>
                </div>
                <div className="row-actions">
                  <span
                    className={`row-amount ${t.kind === 'income' ? 'positive' : 'negative'}`}
                  >
                    {t.kind === 'income' ? '+' : '−'}
                    {currency.format(t.amount)}
                  </span>
                  <button
                    type="button"
                    className="icon-delete"
                    aria-label={`Delete ${t.label}`}
                    onClick={() => remove(t.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
