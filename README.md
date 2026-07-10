# Homify GH

Homify GH is a Ghana-focused home-services marketplace connecting customers with verified local professionals.

## Product roles

- Customer: discovers providers, saves profiles, requests jobs, tracks bookings, records payments and leaves verified reviews.
- Provider: completes KYC, publishes a storefront, manages availability, services, portfolio, jobs and payment records.
- Admin: reviews provider KYC, monitors bookings, resolves disputes and reviews operational activity.

## Local setup

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

Run migrations against the configured database before starting a fresh environment:

```bash
pnpm prisma migrate deploy
```

## Required environment variables

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

Email delivery additionally requires `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `EMAIL_FROM`. Without them, development emails are logged to the server console.

Production URL variables must use the exact HTTPS production origin without a trailing slash. Keep `BETTER_AUTH_SECRET` stable across deployments.

## Useful commands

```bash
pnpm build
pnpm lint
pnpm exec tsc --noEmit
pnpm exec tsx --test tests/*.test.ts
npx tsx --env-file=.env scripts/seed-demo.ts
npx tsx --env-file=.env scripts/make-admin.ts user@example.com
```

## Deployment checklist

1. Configure production environment variables.
2. Run `prisma migrate deploy`.
3. Verify signup, email verification and sign-in on the final production domain.
4. Create an admin by promoting a verified account.
5. Test customer booking, provider acceptance, payment recording, completion and review.
6. Confirm Cloudinary and email credentials before accepting real KYC documents.
