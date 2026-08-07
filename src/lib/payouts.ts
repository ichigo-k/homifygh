/**
 * How a completed booking's held funds are split between the platform and the
 * provider. The customer's wallet is debited when the booking is placed and
 * trued up when the provider quotes, so by completion the platform is already
 * holding `gross` — settling only moves it on.
 *
 * ASSUMPTION: 10% commission. This was not specified anywhere in the codebase;
 * change the rate here and every caller follows.
 */
export const PLATFORM_COMMISSION_RATE = 0.1

/** Rounds to whole pesewas so the two parts always add back up to `gross`. */
export function splitPayout(gross: number) {
  const fee = Math.round(gross * PLATFORM_COMMISSION_RATE * 100) / 100
  return { platformFee: fee, providerPayout: Math.round((gross - fee) * 100) / 100 }
}

/** Smallest cash-out worth the transfer fee on the other side. */
export const MIN_WITHDRAWAL = 20

/**
 * Why a withdrawal can't go ahead, or null if it can. The balance check here is
 * advisory — it makes the UI honest, but the debit itself is applied
 * conditionally so a concurrent request can't overdraw the wallet.
 */
export function withdrawalError(amount: number, balance: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Enter the amount you want to withdraw."
  // Compared with a tolerance, not exactly: 19.99 * 100 is 1998.9999999999998
  // in binary floating point, and that is a perfectly valid amount.
  const pesewas = amount * 100
  if (Math.abs(pesewas - Math.round(pesewas)) > 1e-6) return "Amounts can only go down to the pesewa."
  if (amount < MIN_WITHDRAWAL) return `The smallest withdrawal is GH₵${MIN_WITHDRAWAL}.`
  if (amount > balance) return "That is more than your available balance."
  return null
}
