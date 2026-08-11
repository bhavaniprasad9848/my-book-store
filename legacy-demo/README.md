# MY BOOK STORE

Online shop for selling books from a house collection.

## Public link (free)

- **URL:** https://tangerine-brigadeiros-37a08c.netlify.app  
- **Password:** `My-Drop-Site`

Claim within 60 minutes: https://app.netlify.com/drop/tangerine-brigadeiros-37a08c

## Owner controls

Only `bhavaniprasad9848@gmail.com` can see and use the **Add new book** forms.
Other customers can browse and buy only.

## Corrections included

- Add-new-book form at the end of every category (owner only)
- After payment, receipt is emailed to the customer Gmail via FormSubmit
- Receipt ends with: Thank you buying in MY BOOK STORE. If you like please visit again.
- First-time buyers may need to confirm one activation email from FormSubmit, then tap Resend

## What it does

1. Customer logs in with **name** and **Gmail**
2. Chooses a book type (or browses all six)
3. Browses: Kids, School, History, Nature, Adventure, All Mix
4. Adds books to the **cart**
5. Pays with **card details** (demo checkout — no real charge)
6. After success, a **receipt** opens in the mail app addressed to their Gmail

## Run locally

### Easy way
1. Double-click `setup-local-domain.ps1` once (approve Administrator) so `mybookstore.com` points to your PC.
2. Double-click `start-bookstore.bat` to start the store.
3. Open **http://mybookstore.com** (or the desktop shortcut **My Book Store**).

Domains cannot contain spaces, so use `mybookstore.com` — not `www.my book store.com`.

### Manual way
```bash
python -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173)

## Demo card

Use: `4242 4242 4242 4242` with any future expiry (e.g. `12/28`) and any 3-digit CVV.
