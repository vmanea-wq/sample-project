import type { Page } from '@playwright/test'

/** Shared helpers for all page objects. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForApp() {
    await this.page.getByTestId('app-root').waitFor({ state: 'visible' })
  }
}
