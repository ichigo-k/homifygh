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
