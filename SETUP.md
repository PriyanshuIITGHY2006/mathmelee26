# Complete Setup Guide — Competition Booking App

## What You Have Now (Complete File List)

```
competition-booking/
├── app/
│   ├── globals.css                          ← NEW (was missing)
│   ├── layout.tsx                           ← from app-layout.tsx
│   ├── providers.tsx                        ← from app-providers.tsx
│   ├── page.tsx                             ← from app-page.tsx
│   ├── book/
│   │   └── [date]/
│   │       ├── page.tsx                     ← from app-book-date-page.tsx
│   │       └── [slotId]/
│   │           └── page.tsx                 ← from app-book-slot-page.tsx
│   ├── confirmation/
│   │   └── [bookingId]/
│   │       └── page.tsx                     ← from app-confirmation-page.tsx
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx                     ← from app-admin-login-page.tsx
│   │   └── dashboard/
│   │       └── page.tsx                     ← from app-admin-dashboard-page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts                 ← from api-auth-route.ts
│       ├── slots/
│       │   ├── route.ts                     ← from api-slots-route.ts
│       │   └── [slotId]/
│       │       └── route.ts                 ← from api-slots-slotId-route.ts
│       ├── book/
│       │   └── route.ts                     ← from api-book-route.ts
│       └── admin/
│           ├── bookings/
│           │   └── route.ts                 ← from api-admin-bookings-route.ts
│           └── generate-meet/
│               └── route.ts                 ← from api-admin-generate-meet-route.ts
├── lib/
│   ├── prisma.ts                            ← from lib-prisma.ts
│   ├── auth.ts                              ← from lib-auth.ts
│   └── google-calendar.ts                  ← from lib-google-calendar.ts
├── prisma/
│   └── schema.prisma                        ← from schema.prisma
├── types/
│   └── next-auth.d.ts                       ← NEW (was missing)
├── middleware.ts                            ← from middleware.ts
├── package.json                             ← NEW (was missing)
├── next.config.ts                           ← NEW (was missing)
├── tailwind.config.ts                       ← NEW (was missing)
├── postcss.config.js                        ← NEW (was missing)
├── tsconfig.json                            ← NEW (was missing)
└── .env.example                             ← NEW (was missing)
```

---

## STEP 1 — Create the Next.js Project

Open your terminal and run:

```bash
npx create-next-app@14.2.3 competition-booking \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd competition-booking
```

This scaffolds the project. You will now **replace** the generated boilerplate files
with the files from this download.

---

## STEP 2 — Copy All Files Into Place

Delete the auto-generated placeholders first:

```bash
rm -f app/page.tsx app/layout.tsx app/globals.css
rm -f tailwind.config.ts tsconfig.json next.config.ts package.json
```

Now copy every file from the downloaded archive into the exact paths shown in the
tree above. The table in the original README maps each downloaded filename to its
destination path.

After copying, your directory should look exactly like the tree in Step 0.

---

## STEP 3 — Set Up Google Cloud (OAuth + Calendar API)

This is required for admin login AND for generating Google Meet links.

1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"** → name it `competition-booking` → **Create**
3. In the left menu go to **APIs & Services → Library**
4. Search for and **Enable** these two APIs:
   - **Google Calendar API**
   - **Google People API** (needed for NextAuth to read your profile)
5. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Competition 2025`
   - User support email: your Gmail
   - Developer contact: your Gmail
   - Click **Save and Continue** through all steps
   - On the **Test users** screen, add your Gmail address
   - Click **Back to Dashboard**
6. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `competition-booking-web`
   - Authorised redirect URIs — add both:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
     (add the Vercel URL later after deployment)
   - Click **Create**
7. Copy the **Client ID** and **Client Secret** — you need these in Step 4.

---

## STEP 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/competition"

# Generate this with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-the-output-here"

NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="paste-from-google-cloud-console"
GOOGLE_CLIENT_SECRET="paste-from-google-cloud-console"

# The Gmail address you will use to log in as admin
ADMIN_EMAIL="you@gmail.com"

NEXT_PUBLIC_APP_NAME="Competition 2025"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To generate `NEXTAUTH_SECRET`, run this in your terminal:

```bash
openssl rand -base64 32
```

---

## STEP 5 — Set Up PostgreSQL

### Option A — Local Docker (quickest)

```bash
docker run \
  --name competition-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=competition \
  -p 5432:5432 \
  -d postgres:16
```

Your `DATABASE_URL` is then:
```
postgresql://postgres:password@localhost:5432/competition
```

### Option B — Neon (free, cloud, no Docker needed)

1. Go to https://neon.tech → Sign up free
2. Create a new project → copy the connection string
3. Paste it as `DATABASE_URL` in `.env.local`

---

## STEP 6 — Install Dependencies and Migrate the Database

```bash
npm install

npx prisma generate

npx prisma migrate dev --name init
```

The last command creates all 6 tables (`User`, `Account`, `Session`,
`VerificationToken`, `Slot`, `Booking`) in your PostgreSQL database.

---

## STEP 7 — Run the App

```bash
npm run dev
```

Open http://localhost:3000

| URL | What you see |
|-----|-------------|
| `/` | Public landing page — 4 date cards |
| `/book/2025-06-04` | Time slot listing for that date |
| `/admin/login` | Admin Google login |
| `/admin/dashboard` | Protected slot management + participants |

---

## STEP 8 — Create Your First Slot (Admin Flow)

1. Go to http://localhost:3000/admin/login
2. Click **Continue with Google** and sign in with the Gmail in `ADMIN_EMAIL`
3. You land on the dashboard → **Slot Management** tab
4. Pick a date, set Start = `09:00`, End = `10:00`
5. Click **Generate Meet Link** (this calls the Calendar API and fills the field)
6. Click **Create Slot**
7. Go back to http://localhost:3000 — your date card now shows "1 of 1 slots open"

---

## STEP 9 — Deploy to Vercel

### 9a — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create competition-booking --private --push
# or use GitHub Desktop / the GitHub website
```

### 9b — Import on Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Build command: `prisma migrate deploy && next build`  
   (go to **Settings → General → Build Command** after first deploy if needed)

### 9c — Add Environment Variables

In **Vercel Dashboard → Settings → Environment Variables**, add every variable
from your `.env.local`:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon / Vercel Postgres connection string |
| `NEXTAUTH_SECRET` | Same secret from Step 4 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud |
| `ADMIN_EMAIL` | Your Gmail |
| `NEXT_PUBLIC_APP_NAME` | `Competition 2025` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### 9d — Add Vercel Redirect URI to Google

Go back to Google Cloud Console → **Credentials → your OAuth client** → add:

```
https://your-app.vercel.app/api/auth/callback/google
```

### 9e — Redeploy

Trigger a redeploy from the Vercel dashboard and the production app is live.

---

## Common Errors and Fixes

### "PrismaClientInitializationError" on Vercel

Your `DATABASE_URL` is wrong or the database isn't reachable. Double-check the
connection string in Vercel environment variables and make sure SSL is enabled
(Neon requires `?sslmode=require` at the end).

```
DATABASE_URL="postgresql://...?sslmode=require"
```

### "OAuthCallback" error on login

The redirect URI in Google Cloud doesn't exactly match `NEXTAUTH_URL`. Make sure
there's no trailing slash and the protocol matches (https in production).

### "Google Calendar not connected" when generating Meet link

You signed in before the app requested Calendar scope. Sign out of the admin
dashboard, then sign back in — NextAuth will re-request Calendar permissions on
the next `consent` prompt.

### TypeScript errors on `session.user.id`

Make sure `types/next-auth.d.ts` exists at the project root and `tsconfig.json`
includes `"**/*.ts"` in the `include` array. Run `npx tsc --noEmit` to verify.

---

## Quick Reference: All npm Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Migrate + build for production |
| `npm run db:migrate` | Create a new Prisma migration |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
