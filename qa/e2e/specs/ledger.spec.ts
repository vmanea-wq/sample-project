import { test, expect } from '@playwright/test'
import { LedgerPage } from '../pages/ledger.page'

test.describe('Pocket Ledger E2E', () => {
  test('add expense updates balance and list', async ({ page }) => {
    const ledger = new LedgerPage(page)
    await ledger.gotoHome()
    await ledger.addExpense('42.5', 'utilities')
    await ledger.expectRowVisible('utilities')
    await expect(page.getByTestId('expense-total')).toContainText('42')
  })

  test('add income increases balance', async ({ page }) => {
    const ledger = new LedgerPage(page)
    await ledger.gotoHome()
    await ledger.chooseIncome()
    await ledger.fillAmount('200')
    await ledger.fillDescription('paycheck')
    await ledger.submitTransaction()
    await expect(page.getByTestId('balance-value')).toContainText('200')
  })

  test('delete row returns to empty state', async ({ page }) => {
    const ledger = new LedgerPage(page)
    await ledger.gotoHome()
    await ledger.addExpense('5', 'coffee')
    await ledger.deleteRowByLabel('coffee')
    await ledger.expectEmptyState()
  })
})
