import { expect, type Locator } from '@playwright/test'
import { BasePage } from './base.page'

/** Page Object for the Pocket Ledger UI. */
export class LedgerPage extends BasePage {
  private get root(): Locator {
    return this.page.getByTestId('app-root')
  }

  async gotoHome() {
    await this.page.goto('/')
    await this.waitForApp()
  }

  async chooseExpense() {
    await this.page.getByTestId('toggle-expense').click()
  }

  async chooseIncome() {
    await this.page.getByTestId('toggle-income').click()
  }

  async fillAmount(value: string) {
    await this.page.getByTestId('input-amount').fill(value)
  }

  async fillDescription(value: string) {
    await this.page.getByTestId('input-label').fill(value)
  }

  async submitTransaction() {
    await this.page.getByTestId('submit-add').click()
  }

  async addExpense(amount: string, description: string) {
    await this.chooseExpense()
    await this.fillAmount(amount)
    await this.fillDescription(description)
    await this.submitTransaction()
  }

  async expectBalanceContains(pattern: RegExp) {
    await expect(this.page.getByTestId('balance-value')).toContainText(pattern)
  }

  async expectRowVisible(text: string) {
    await expect(this.root.getByText(text, { exact: false })).toBeVisible()
  }

  async deleteRowByLabel(label: string) {
    await this.page.getByRole('button', { name: new RegExp(`delete ${label}`, 'i') }).click()
  }

  async clearAllConfirmed() {
    this.page.once('dialog', (d) => d.accept())
    await this.page.getByRole('button', { name: /clear all/i }).click()
  }

  async expectEmptyState() {
    await expect(this.page.getByTestId('empty-state')).toBeVisible()
  }
}
