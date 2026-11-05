#!/usr/bin/env bash
# One-command local start for MY BOOK STORE (macOS / Linux).
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  sed -i.bak "s|replace-with-a-long-random-secret|$secret|" .env && rm -f .env.bak
  echo "Created .env (add Stripe/Resend keys later to enable checkout and emails)."
fi

[ -d node_modules ] || npm install

first_run=0; [ -f prisma/dev.db ] || first_run=1
npx prisma migrate deploy
[ "$first_run" = 1 ] && npx prisma db seed

rm -rf .next
npm run dev
