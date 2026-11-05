# MY BOOK STORE (Real App)

Full-stack bookstore with:

- Auth.js email/password login
- Prisma + SQLite database
- Owner-only book inventory (`bhavaniprasad9848@gmail.com`)
- Stripe Checkout payments
- Resend receipt emails

The original vanilla demo is saved in [`legacy-demo/`](legacy-demo/).

## Quick start

Windows (PowerShell):

```powershell
.\start.ps1
```

macOS / Linux:

```bash
./start.sh
```

The script creates `.env` with a random `AUTH_SECRET`, installs packages,
creates the SQLite database, seeds it on first run, and starts the dev server.

Manual steps, if you prefer:

```bash
cp .env.example .env   # then set AUTH_SECRET to a long random string
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seeded owner account
- Email: `bhavaniprasad9848@gmail.com`
- Password: `OwnerPass123!`
- Change this password after first login in production.

Customers can register at `/register`.

## Environment

Copy `.env.example` to `.env` and fill:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file path |
| `AUTH_SECRET` | NextAuth secret |
| `STRIPE_SECRET_KEY` | Stripe secret (test: `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender |

Without Stripe/Resend keys you can still:
- register/login
- browse books
- add books as owner
- use cart

Checkout and Gmail receipts activate after keys are added.

## Stripe test flow

1. Add Stripe test keys to `.env`
2. In another terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Put the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
4. Shop → cart → **Pay with Stripe Checkout**
5. Use test card `4242 4242 4242 4242`

The success page also calls `/api/orders/confirm` so fulfillment works even if the webhook listener is not running.

## Receipt email text

```text
Thank you buying in MY BOOK STORE.
If you like please visit again.
```

## Scripts

- `npm run dev` — local server
- `npm run db:seed` — reseed admin + books
- `npm run build` — production build
