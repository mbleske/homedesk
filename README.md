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
  created_at text
);
```

3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**. You'll need these in Part 2.

---

## Part 2: Set Up the React App

1. Create a new React project and install dependencies:

```bash
npx create-react-app homedesk
cd homedesk
npm install @supabase/supabase-js
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
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

5. Update `public/index.html` — remove the CRA boilerplate comments and update the title:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" sizes="any" />
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

const supabaseUrl = 'YOUR_PROJECT_URL';
const supabaseKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

4. Test it locally:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) — tickets should load and save to Supabase.

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

Trigger a redeploy after adding these.

---

## Part 4: Mobile Setup (PWA)

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
| 📱 **Mobile** | Add to Home Screen from browser |
| 🔁 **Sync** | Real-time across all devices |
| 💰 **Cost** | $0 |