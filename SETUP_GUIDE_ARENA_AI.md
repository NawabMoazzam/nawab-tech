# Setup Guide — Better Auth + ImageKit (Arena AI)

You are new to Arena AI? This is how this workspace works + how to finish setup.

---

## Part 1: How Arena AI works (2 min)

This chat is connected to a **real cloned Git repo** at `/home/user/nawab-tech` branch `arena/019ff403-nawab-tech`.

- Every file I create/edit here is saved automatically (you see live).
- When you click **Preview** (top right), it runs your Next.js dev server.
- You can run `npm run dev` yourself via bash tool, but I already installed everything.
- When you are happy, push to GitHub via `git push origin arena/019ff403-nawab-tech` and open PR to main.

**No need to download anything.**

---

## Part 2: What I just implemented

### 1. Better Auth 1.3.27 (latest, free)
- `lib/auth.ts` - server config with `mongodbAdapter(db)` using raw MongoClient from your existing `mongoose` cache (serverless safe)
- `lib/auth-client.ts` - client `createAuthClient()`
- `app/api/auth/[...all]/route.ts` - API handler for all `/api/auth/*`
- `proxy.ts` - **Next.js 16 replacement for middleware.ts** (renamed export `proxy`, Node runtime, matcher `/admin/:path*`). It does fast redirect if no session cookie, but real auth check is in `app/admin/layout.tsx` (mandatory due to CVE May 2026 bypass).
- `app/admin/login/page.tsx` + `components/admin/login-form.tsx` - email+password login/signup
- `app/admin/layout.tsx` - server check `auth.api.getSession(headers)` -> redirect if not logged
- `app/admin/page.tsx` - dashboard with env checklist
- `app/admin/posts/*` - CRUD UI for blog posts

### 2. ImageKit Complete Free (20GB BW + 3GB storage)
- `lib/imagekit.ts` - server SDK using `@imagekit/nodejs` + ImageKit v6 fallback
- `app/api/imagekit/auth/route.ts` - returns signature/token for client-side upload (if you want)
- `app/api/admin/upload/route.ts` - **server upload** (recommended) POST FormData, DELETE by fileId, protected by Better Auth
- `components/admin/imagekit-uploader.tsx` - drag upload button used in post form
- `next.config.mjs` - added `images.remotePatterns: ["ik.imagekit.io"]`

### 3. Blog
- `models/blog-post.ts` - Mongoose model
- `lib/blog/queries.ts` - `getAllPublishedPosts()` etc with fallback to static post when DB missing
- Updated `app/blog/page.tsx` -> ISR 3600 + revalidateTag
- Updated `app/blog/[slug]/page.tsx` -> uses `ArticleContent` with `react-markdown` + cover image from ImageKit
- Updated `app/blog/category/[slug]/page.tsx` + `sitemap.ts`

### 4. Editor
- `components/admin/post-form.tsx` - uses `@uiw/react-md-editor` (GitHub-like) + ImageKit uploader, slug auto-gen, SEO fields, tags, featured flag
- Markdown stored in DB, rendered via `components/blog/article-content.tsx`

---

## Part 3: What YOU need to do (5 min)

### Step 1: Create ImageKit account (Free Complete)

1. Go https://imagekit.io/registration/?plan=media-delivery
2. Choose **Complete Media Processing + DAM** -> **Forever Free** (20GB BW + 3GB storage). NOT DAM-only.
3. After login, go to Dashboard -> Developer Options -> **API Keys**
   - Copy `Public Key`, `Private Key`, `URL Endpoint` (like `https://ik.imagekit.io/abcd123`)
4. You will paste them into `.env.local`

### Step 2: Env vars

Create `.env.local` in project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Edit:

```
MONGODB_URI=your existing mongodb+srv://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=run: openssl rand -base64 32 and paste
BETTER_AUTH_URL=http://localhost:3000
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

For Vercel deployment, add same env vars in Vercel Dashboard -> Project -> Settings -> Environment Variables. Use production URL for `NEXT_PUBLIC_BASE_URL` and `BETTER_AUTH_URL` e.g. `https://nawab-tech.vercel.app`

### Step 3: Run locally

In Arena, open terminal (bash tool) or local machine:

```bash
npm run dev
```

- Open http://localhost:3000/blog -> should show fallback post if DB empty, or DB posts if exist
- Open http://localhost:3000/admin/login -> Create first account (Sign up)
- After sign up, you are logged in, redirect to /admin
- **Make yourself admin:** Atlas -> database -> collection `user` -> find your email doc -> edit -> add field `role: "admin"`

Or run script:

```bash
npx tsx scripts/seed-admin.ts your-email@example.com
```

### Step 4: Create first post

- /admin/posts/new -> fill title, excerpt, content markdown, upload cover via ImageKit button
- Status: published -> Publish
- Check /blog -> should appear (ISR revalidated)

### Step 5: Deploy to Vercel

- Push branch: `git push origin arena/019ff403-nawab-tech`
- In Vercel, if auto-deploy from main, merge PR or set this branch as preview.
- Ensure all env vars are set in Vercel.

---

## Part 4: Common Issues

**Build fails: Cannot find module 'better-auth'?** Did you run `npm install`? I already did in Arena.

**proxy.ts not working?** In Next.js 16, middleware.ts is deprecated silently. I used proxy.ts. If hosting provider still not supports proxy.ts, rename file to middleware.ts temporarily (but Vercel supports proxy.ts since Q1 2026).

**ImageKit upload 401?** Check you are logged in at /admin/login, session cookie exists, and env keys correct.

**Better Auth session not persisting?** Ensure BETTER_AUTH_SECRET is at least 32 chars and same between builds. Don't rotate without logout all.

**MongoDB connection error?** Ensure MONGODB_URI uses standard `mongodb+srv://` and Atlas whitelist allows Vercel IPs (allow all 0.0.0.0/0 if testing).

---

## Part 5: Cost

- Vercel Hobby: $0 (100GB BW)
- MongoDB Atlas M0: $0 (512MB)
- Better Auth: $0 (MIT open source)
- ImageKit Complete Free: $0 (20GB BW/month + 3GB storage)

Total $0 forever for agency blog scale.

---

## Next Improvements (optional)

- Add `better-auth` admin plugin UI to manage users at /admin/users
- Add view counter increment in `[slug]/page.tsx` via API
- Add `next-sitemap` or ImageKit SEO transforms `tr=w-1200,f-auto`
- Add drafts preview via `?preview=true` + session check

Ask me to build any of these.
