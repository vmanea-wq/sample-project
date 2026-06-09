import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { formatLedgerWhen } from './formatLedgerWhen'

describe('formatLedgerWhen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats ISO string without throwing', () => {
    const s = formatLedgerWhen('2024-03-02T08:30:00.000Z')
    expect(s.length).toBeGreaterThan(0)
  })
})
