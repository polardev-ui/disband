# Disband (PWA)

A mobile-first React + TypeScript PWA chat shell for iPhone X and up.

## Running locally

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Create a `profiles` table and `avatars` storage bucket as described in the in‑app comments.
3. Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Restart the dev server.
```