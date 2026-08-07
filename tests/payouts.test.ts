import assert from "node:assert/strict"
import test from "node:test"
import { MIN_WITHDRAWAL, PLATFORM_COMMISSION_RATE, splitPayout, withdrawalError } from "../src/lib/payouts"

test("commission and payout always add back up to the gross amount", () => {
  // Amounts that expose float drift if the two parts are rounded independently.
  for (const gross of [0, 1, 5, 33.33, 99.99, 150, 250.55, 1000, 12345.67]) {
    const { platformFee, providerPayout } = splitPayout(gross)
    assert.equal(Math.round((platformFee + providerPayout) * 100) / 100, gross, `split of ${gross} did not balance`)
  }
})

test("commission matches the configured rate", () => {
  const { platformFee, providerPayout } = splitPayout(200)
  assert.equal(platformFee, 200 * PLATFORM_COMMISSION_RATE)
  assert.equal(providerPayout, 200 - platformFee)
})

test("both parts round to whole pesewas", () => {
  const { platformFee, providerPayout } = splitPayout(33.33)
  for (const part of [platformFee, providerPayout]) {
    assert.equal(Math.round(part * 100), part * 100, `${part} is finer than a pesewa`)
  }
})

test("a zero-value booking settles to nothing rather than a negative payout", () => {
  assert.deepEqual(splitPayout(0), { platformFee: 0, providerPayout: 0 })
})

test("a withdrawal within the balance is allowed", () => {
  assert.equal(withdrawalError(50, 120), null)
  assert.equal(withdrawalError(120, 120), null, "withdrawing the whole balance should be fine")
})

test("a withdrawal cannot exceed the balance", () => {
  assert.match(withdrawalError(120.01, 120) ?? "", /balance/)
})

test("a withdrawal below the minimum is refused", () => {
  assert.match(withdrawalError(MIN_WITHDRAWAL - 0.01, 500) ?? "", /smallest/)
})

test("junk amounts are refused rather than debited", () => {
  for (const amount of [0, -50, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.notEqual(withdrawalError(amount, 500), null, `${amount} should not be withdrawable`)
  }
})

test("amounts finer than a pesewa are refused", () => {
  assert.match(withdrawalError(50.005, 500) ?? "", /pesewa/)
})
