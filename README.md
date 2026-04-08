# 🏠 HomeDesk

A house ticket system (think Jira, but for home). Built with React + Supabase + Vercel.

> **Stack:** React · Supabase · Vercel  
> **Cost:** $0  

---

## Prerequisites

- Node.js installed
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A GitHub account

---

## Part 1: Set Up the Database (Supabase)

Supabase is a free Postgres database with a real-time API that syncs tickets across devices.

1. Go to [supabase.com](https://supabase.com) and sign up. Click **New Project**, name it `homedesk`, choose a region close to your location, and set a database password.

2. In the Supabase dashboard, go to **SQL Editor** and run the following:

```sql
create table tickets (
  id text primary key,
  title text not null,
  category text,
  priority text,
  status text,
  assignee text,
  due_date text,
  description text,
  created_at text,
  last_updated text
);
```

3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**. You'll need these in Part 2.

---

## Part 2: Set Up the React App

1. Create a new React project and install dependencies:

```bash
npx create-react-app homedesk
cd homedesk
npm install @supabase/supabase-js @vercel/analytics --legacy-peer-deps
```

2. Replace the contents of `src/App.jsx` with the HomeDesk component code.

3. Clean up the CRA boilerplate — delete these files:

```
src/App.js
src/App.css
src/App.test.js
src/logo.svg
src/reportWebVitals.js
src/setupTests.js
src/index.css
```

4. Replace `src/index.js` with:

```js
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <Analytics />
  </>
);
```

5. Update `public/index.html` — remove the CRA boilerplate comments and update the title:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1a1a2e" />
    <meta name="description" content="HomeDesk - Home task tracker" />
    <title>HomeDesk</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

6. Create a new file `src/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);
```

7. Create `.env.local` in the project root (this file is gitignored and never committed):

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
REACT_APP_SITE_PASSWORD=your_site_password
```

| Variable | Where to find it |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `REACT_APP_SUPABASE_KEY` | Supabase → Project Settings → API → anon/public key (the long `eyJ...` token) |
| `REACT_APP_SITE_PASSWORD` | Any password you choose — required to access the app |

> **Note:** CRA only exposes env vars prefixed with `REACT_APP_` to the browser. Restart `npm start` after creating or editing `.env.local`.

8. Test it locally:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) — you'll be prompted for your password, then tickets should load and save to Supabase.

---

## Part 3: Deploy to Vercel

1. Create a new private GitHub repo called `homedesk` and push the project:

```bash
git init
git add .
git commit -m "init"
git push
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → **Import from GitHub**. Select the `homedesk` repo and click **Deploy**. Vercel will provide a live URL (e.g. `homedesk.vercel.app`).

3. In Vercel, go to **Project Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_KEY` | Your Supabase anon key |
| `REACT_APP_SITE_PASSWORD` | Your site password |

Trigger a redeploy after adding these.

---

## Part 4: Daily Email Digest (Resend + Supabase Edge Function)

### Set up Resend

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add and verify a sending domain (or use Resend's onboarding sandbox for testing).
3. In [supabase/functions/daily-digest/index.ts](supabase/functions/daily-digest/index.ts), confirm the `from` field matches your verified domain.

### Deploy the Edge Function

1. Install the Supabase CLI (use Homebrew on macOS):
   ```bash
   brew install supabase/tap/supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Your project ref is in Supabase → Project Settings → General.

3. Set the Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set DIGEST_TO=mike@example.com,alisa@example.com
   ```
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase.

4. Deploy the function:
   ```bash
   supabase functions deploy daily-digest
   ```

   To redeploy after changes, run the same command again.

### Schedule it with pg_cron

First, enable the required extensions in the Supabase dashboard:

1. Go to **Database → Extensions**
2. Search for `pg_cron` and toggle it on
3. Search for `pg_net` and toggle it on

Then, in the SQL Editor, schedule the digest:

```sql
select cron.schedule(
  'daily-digest',
  '0 14 * * *',
  $$
  select net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/daily-digest',
    headers := '{"Authorization": "Bearer your-anon-key"}'::jsonb
  )
  $$
);
```

Replace `your-project-ref` with your project ref and `your-anon-key` with your anon/public key from Project Settings → API.

> **Schedule note:** `0 14 * * *` runs at 7 AM PDT (summer) and 6 AM PST (winter) — it naturally follows the Pacific daylight saving shift.

### What the digest includes

The email is sent daily and groups tickets into sections in this order:

| Section | Contents |
|---|---|
| ✅ Completed (Last 24h) | Tickets marked Done in the last 24 hours |
| ⚠️ Overdue | Open/in-progress tickets past their due date |
| 🔵 In Progress | All in-progress tickets |
| 🆕 New (Last 24h) | Tickets created in the last 24 hours |
| ⬜ Open | All open tickets |
| ✏️ Updated (Last 24h) | Tickets modified in the last 24 hours (excludes new) |

Tickets without a due date sort to the bottom within each section.

---

## Part 5: Mobile Setup (PWA)

No app store needed — HomeDesk works as a Progressive Web App directly from the browser.

**iPhone (Safari)**
1. Open the Vercel URL in Safari
2. Tap the Share icon (box with arrow)
3. Tap **Add to Home Screen**
4. Name it `HomeDesk` → **Add**

**Android (Chrome)**
1. Open the Vercel URL in Chrome
2. Tap the 3-dot menu (top right)
3. Tap **Add to Home Screen**
4. Name it `HomeDesk` → **Add**

---

## Quick Reference

| | |
|--|--|
| 🛢️ **Database** | Supabase (free tier) |
| 🚀 **Hosting** | Vercel (free) |
| 📧 **Email digest** | Resend + Supabase Edge Function |
| 📱 **Mobile** | Add to Home Screen from browser |
| 🔁 **Sync** | Real-time across all devices |
| 💰 **Cost** | $0 |
