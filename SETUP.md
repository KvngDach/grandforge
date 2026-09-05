# 🏰 GrandForge — Complete Setup Guide
### From zero to live website in ~30 minutes. No coding required.

---

## What you're setting up

| Service | What it does | Cost |
|---|---|---|
| **GitHub** | Stores your code | Free |
| **Vercel** | Hosts your website online | Free |
| **Supabase** | Saves user data & streaks | Free |
| **Lichess OAuth App** | Lets users log in with Lichess | Free |

---

## STEP 1 — Upload the code to GitHub

1. Go to **https://github.com** and create a free account
2. Click the **+** button (top right) → **New repository**
3. Name it `grandforge` → tick **Private** → click **Create repository**
4. Click **uploading an existing file** (it's a link in the middle of the page)
5. **Drag the entire `grandforge` folder** into the upload box
6. Scroll down, click **Commit changes**

✅ Your code is now on GitHub.

---

## STEP 2 — Set up Supabase (your database)

1. Go to **https://supabase.com** → Sign up free
2. Click **New Project** → give it any name → pick any region → create
3. Wait ~1 minute for it to set up
4. In the left sidebar click **SQL Editor**
5. Paste this SQL and click **Run** (green button):

```sql
-- Users table
create table if not exists public.users (
  id           text primary key,
  username     text not null unique,
  rating_rapid integer,
  streak       integer default 0,
  best_streak  integer default 0,
  total_sessions integer default 0,
  total_puzzles  integer default 0,
  last_session_date date,
  created_at   timestamptz default now()
);

-- Daily sessions table
create table if not exists public.daily_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       text references public.users(id) on delete cascade,
  session_date  date not null default current_date,
  week_number   integer not null default 1,
  current_stage integer not null default 0,
  puzzles_done  integer not null default 0,
  completed     boolean not null default false,
  started_at    timestamptz default now(),
  completed_at  timestamptz,
  unique(user_id, session_date)
);

-- Disable RLS for now (enable later for production security)
alter table public.users disable row level security;
alter table public.daily_sessions disable row level security;
```

6. Go to **Settings → API** (left sidebar)
7. Copy these two values — you'll need them soon:
   - **Project URL** (looks like `https://abcdef.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)

✅ Your database is ready.

---

## STEP 3 — Register your Lichess OAuth App

1. Log in to your Lichess account at **https://lichess.org**
2. Go to **https://lichess.org/account/oauth/app**
3. Click **New application** and fill in:
   - **Name:** GrandForge
   - **Redirect URIs:** (two lines — paste both exactly)
     ```
     http://localhost:5173/callback
     https://YOUR-PROJECT.vercel.app/callback
     ```
     *(Don't worry about the Vercel URL yet — fill it in after Step 4)*
   - **Scopes:** tick `preference:read`
4. Click **Submit**
5. Copy your **Client ID** (shown after creation)

✅ Lichess login is ready.

---

## STEP 4 — Deploy to Vercel

1. Go to **https://vercel.com** → Sign up with your GitHub account
2. Click **Add New → Project**
3. Find `grandforge` in the list → click **Import**
4. Before clicking Deploy, click **Environment Variables** and add these:

| Variable Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 2 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2 |
| `VITE_LICHESS_CLIENT_ID` | Your Lichess Client ID from Step 3 |
| `VITE_REDIRECT_URI` | `https://YOUR-PROJECT-NAME.vercel.app/callback` |

5. Click **Deploy** — wait about 60 seconds
6. Vercel gives you a URL like `https://grandforge-xyz.vercel.app`

✅ Your site is live!

---

## STEP 5 — Final fix: update your Lichess redirect URI

1. Go back to **https://lichess.org/account/oauth/app**
2. Edit your GrandForge app
3. Replace the placeholder Vercel URL with your real one from Step 4
4. Also update `VITE_REDIRECT_URI` in Vercel → Settings → Environment Variables
5. After updating env vars in Vercel, go to **Deployments → Redeploy**

---

## ✅ You're live!

Visit your Vercel URL, sign in with Lichess, and begin your first session.

Share the URL with friends — they can create their own accounts too.

---

## Troubleshooting

**"Redirect URI mismatch" error on login**
→ The URI in Lichess and in your Vercel env vars don't match exactly. Check for trailing slashes.

**White screen / app not loading**
→ Go to Vercel dashboard → your project → Functions tab → check for errors.

**Database not saving**
→ Go to Supabase → Table Editor → check the `users` and `daily_sessions` tables have data.

**Want a custom domain (e.g. grandforge.com)?**
→ Buy a domain at Namecheap (~$12/yr) → in Vercel go to Settings → Domains → Add domain → follow instructions.

---

## What's coming in Step 2

- In-app puzzle board (no need to switch to Lichess manually)
- Automatic game detection via Lichess API
- Leaderboards between friends
- Progress charts

---
*Built with React + Vite + Supabase + Lichess API*
