# Blog Architecture Recommendation — Nawab Tech

> Goal: 100% FREE on Vercel Hobby + Existing MongoDB Atlas Free Tier
> Status: You already have MDX ready, Mongoose connected, but posts are hardcoded in `lib/blog/posts.ts`

---

## 1. Current State Analysis

- **Framework:** Next.js 16 App Router, Tailwind 4, shadcn
- **Blog Today:** `lib/blog/posts.ts` returns a hardcoded array (1 post). `contentPath` is just a string rendered, not real MDX/Markdown.
- **DB:** You already have `lib/db.ts` with Mongoose cache for serverless — used for enquiries (`models/enquiry.ts`). This is perfect.
- **Deploy:** Vercel Hobby (free). No persistent server allowed, only Serverless Functions.
- **MDX:** `@next/mdx`, `remark-gfm`, `rehype-slug` already installed but unused.

This means you are 70% ready for a Custom Admin solution already.

## 2. Option Comparison — For YOUR Project

### Option A: WordPress (Headless)

**How it works:** Host WordPress elsewhere (Hostinger, WordPress.com), fetch via WPGraphQL / REST.

| Pros | Cons (Dealbreakers for you) |
|------|------------------------------|
| Familiar editor | **Not Free:** Needs hosting ~$4-15/mo minimum. Free wordpress.com has ads, blocked API. |
| Many plugins | **Slow:** External API call on every blog page = 300-800ms extra TTFB |
| SEO plugins | **2 systems to maintain:** WP security updates, PHP, backups |
| | **Vercel unfriendly:** No webhook revalidation free tier is tricky |
| | **Overkill:** You don't need WooCommerce, etc. |

**Verdict:** Only if client insists on WordPress. Not for your 100% free goal.

### Option B: Strapi 5

**How it works:** Self-hosted Node headless CMS. Requires always-on server + Postgres.

| Pros | Cons |
|------|------|
| Nice admin UI | **Cannot run on Vercel Free.** Strapi is not serverless compatible. Needs persistent server. |
| Auto REST/GraphQL | **Hosting cost:** Render free sleeps after 15min (cold start 30s), Railway/Flow free limited. Production needs $7-15/mo. |
| Roles/permissions | **Heavy:** 500MB RAM minimum, slow on free tiers |
| | **Double DB:** You'd have Postgres for Strapi + Mongo for enquiries |

**Verdict:** Great CMS, but wrong for Vercel free. You'd lose the "completely free" requirement.

### Option C: Custom Admin Panel (RECOMMENDED)

**How it works:** `/admin` routes inside your Next.js app + MongoDB Atlas (which you already use)

| Pros | Cons |
|------|------|
| **$0 total** — Uses Vercel Hobby + Atlas Free (512MB = ~2000 blog posts) | You build UI (1-2 days) |
| **Single deployment — no second service** | No drag-drop page builder (you don't need it) |
| **Blazing fast:** Direct DB query, no external latency. SSG/ISR compatible. | |
| **Full control:** SEO fields, readingTime, featured, draft/published, views tracking — your exact `BlogPost` type | |
| **Security:** No WordPress CVEs, no PHP | |
| **Leverages existing code:** `lib/db.ts` caching already serverless-safe | |

**Verdict: Winner for you.**

---

## 3. Recommended Architecture — 100% FREE

### 3.1 High-Level Diagram

```
[ Admin /admin ] --(Auth middleware)--> [ Server Actions / API Routes ] --> [ MongoDB Atlas Free ]
      |                                              |
      | writes post                                  | revalidateTag('posts')
      v                                              v
[ /admin/posts/new ] editor saves Markdown ------> [ Public Pages /blog, /blog/[slug] ]
                                                          |
                                                          | ISR: fetch from DB + remark
                                                          v
                                                    [ Vercel CDN Cache ]
```

### 3.2 Data Models

**Reuse your existing types**

```ts
// models/blog-post.ts
{
  slug: String, unique, indexed, lowercase
  title: String, required
  excerpt: String, required, maxLength 200
  content: String, required // Markdown/MDX string
  category: { name: String, slug: String, lowercased, indexed }
  tags: [String]
  author: { name: String, role: String } // or ref to User for multi-author later
  coverImage: String // Cloudinary URL, free 25GB
  status: 'draft' | 'published', indexed, default 'draft'
  featured: Boolean, default false
  readingTime: Number // auto-calc words/200
  views: Number, default 0
  seo: { 
    title: String, 
    description: String,
    keywords: [String],
    ogImage: String
  }
  publishedAt: Date, indexed
  updatedAt: Date
}

// models/user.ts (for admin)
{
  email: unique, lowercase
  password: hashed with bcrypt
  name: String
  role: 'admin' // future: editor
}
```

**Why not add Category as collection?** Keep it simple for V2. Use embedded {name, slug} like now. When you have >5 categories, extract to collection.

### 3.3 Folder Structure (Next.js 16 best practice)

```
app/
  (public)/
    blog/
      page.tsx // async, fetch from DB, ISR 1 hour
      [slug]/page.tsx // generateStaticParams from DB
      category/[slug]/page.tsx
  (admin)/
    admin/
      layout.tsx // admin sidebar shell, checks auth
      login/page.tsx // public
      page.tsx // dashboard stats
      posts/
        page.tsx // list table with search, filter
        new/page.tsx // editor
        [id]/edit/page.tsx
  api/
    admin/
      auth/
        login/route.ts
        logout/route.ts
        me/route.ts
      posts/
        route.ts // GET (list), POST (create)
        [id]/route.ts // GET, PATCH, DELETE
      upload/route.ts // Cloudinary sign or Vercel Blob
lib/
  blog/
    queries.ts // server-only: getAllPublishedPosts(), getPostBySlug()
  auth.ts // jose JWT sign/verify, httpOnly cookies
  db.ts // you have this
  cloudinary.ts // upload helper
components/
  admin/
    editor.tsx // markdown editor - see suggestion
    post-form.tsx
    admin-sidebar.tsx
    login-form.tsx
middleware.ts // protect /admin/* !except /admin/login
```

### 3.4 Auth — Keep it Free & Simple (No Auth0 bill)

Don't use NextAuth if you want minimal deps. Use this:

**Middleware + JWT httpOnly cookie**

```ts
// middleware.ts
export function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/login')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.redirect('/admin/login')
    try { await verifyJWT(token) } catch { redirect }
  }
}
```

- Login: `bcrypt.compare()` + `jose.signJWT({...}, 7 days)` + `cookies().set('admin_token', token, { httpOnly, secure, sameSite: 'lax' })`
- Password hash at signup/seeding: `bcryptjs` (free, no native deps)
- Seed one admin via script: `npm run seed:admin`

Cost: $0. No external provider.

### 3.5 Editor — Best Free Choice

| Editor | Size | Why |
|--------|------|-----|
| **@uiw/react-md-editor** | ~150kb | GitHub-style, preview, upload handler, easiest free |
| **Novel / Tiptap** | bigger | Notion-like, beautiful but needs more setup |
| **Simple Textarea + react-markdown live preview** | tiny | MVP in 2 hours |

**My pick for you:** `@uiw/react-md-editor` (MIT) + `react-markdown` for public rendering (you already have `remark-gfm`). Store content as plain Markdown.

**Image handling for $0:**
- Best FREE: **Cloudinary Free** — 25GB storage, 25GB bandwidth, free URL delivery. No credit card.
- Alternative: Vercel Blob Hobby — 1GB free storage. Enough for ~500 optimized blog images if you compress. But Cloudinary transforms for free.
- Implementation: client requests `/api/admin/upload` which returns Cloudinary signed upload -> direct upload, save URL to post.

### 3.6 Public Rendering (SEO & Speed — critical for Vercel free)

Change `lib/blog/posts.ts` to DB version:

```ts
// lib/blog/queries.ts - server only
'use server'
import { connectDB } from '@/lib/db'
import Post from '@/models/blog-post'

export async function getAllPublishedPosts() {
  await connectDB()
  return Post.find({ status: 'published' }).sort({ publishedAt: -1 }).lean()
}
// + unstable_cache or revalidateTag
```

`app/blog/page.tsx`:
```ts
export const revalidate = 3600 // ISR 1 hour
const posts = await getAllPublishedPosts()
```

`generateStaticParams()`:
```ts
export async function generateStaticParams() {
  const posts = await getAllPublishedPosts()
  return posts.map(p => ({ slug: p.slug }))
}
```

Use `next-mdx-remote` or `react-markdown` + `remark-gfm` + `rehype-slug` + `rehype-pretty-code` for code blocks.

This keeps you within Vercel free 100h build time, since pages are static but revalidated on demand.

Add `revalidateTag('posts')` in POST/PATCH handlers so new post appears instantly.

### 3.7 Performance & Vercel Free Limits

- Vercel Hobby: 100GB bandwidth — blog viewing static HTML costs almost nothing (~50kb/page)
- Serverless Functions: 10s timeout — DB query 50-100ms is fine
- MongoDB Atlas Free: 512MB, shared RAM — enable SRV connection reuse (you already do `mongooseCache`)
- ISR means first hit after publish triggers rebuild, then cached globally.
- Do NOT use `Post.find()` inside Client Component. Keep queries server-only.

### 3.8 Cost Breakdown for 1 Year

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Vercel Hobby | 100GB BW, 6000 exec hours | ~5GB/month for blog | $0 |
| MongoDB Atlas M0 | 512MB, shared | ~10MB for 100 posts | $0 |
| Cloudinary Free | 25GB media, 25k transforms | ~200MB/month | $0 |
| Next.js + Custom Admin | — | — | $0 |
| **Total** | | | **$0/month** |

vs WordPress hosted: $5-15/mo, Strapi hosted: $7-25/mo.

---

## 4. Implementation Roadmap (I can build this)

**Phase 1 — Models & Auth (2-3 hours)**
- Create `models/blog-post.ts`, `models/user.ts`
- `lib/auth.ts` JWT helpers
- `middleware.ts`
- `/admin/login` page
- seed script

**Phase 2 — Admin CRUD (4-5 hours)**
- `/api/admin/posts` routes
- `/admin/posts` table (shadcn Table + Badge)
- `/admin/posts/new` with md-editor, slug auto-gen from title (`slugify`), SEO fields auto-fill but editable
- Edit/Delete

**Phase 3 — Public Migration (2 hours)**
- Replace `lib/blog/posts.ts` hardcoded with DB queries
- Render markdown via `react-markdown` component `components/blog/article-content.tsx` (currently empty file, perfect)
- Add Draft preview mode: `?preview=true` shows draft posts to authenticated admin

**Phase 4 — Polish (1-2 hours)**
- Upload to Cloudinary
- View counter (increment on page view via Route Handler)
- Related posts by tag/category (DB query)
- Sitemap.ts dynamic from DB

**Total:** ~1-2 days solo.

---

## 5. Why NOT PayloadCMS / Keystatic / Notion API?

- **PayloadCMS 3.0** is actually a great alternative — runs on Next.js, can deploy on Vercel (uses MongoDB too). It *is* free. If you don't want to code admin UI, use Payload. But it's heavier bundle (+~8 deps), slower cold start. Custom admin is leaner for your simple blog.

- **Keystatic** (by Thinkmill) — Git-based, stores posts as .mdx files in repo itself, admin UI on `/keystatic`. 100% free, no DB. Great if you are solo writer. But editing triggers GitHub commit -> Vercel rebuild (60s). No draft without commit.

- **Notion API** — tempting, but slow, rate limited, not SEO ideal.

For Nawab Tech brand site where blogs are marketing + SEO, Custom + Mongo is optimal.

---

## 6. Security Checklist for Vercel

- Rate limit login with simple in-memory map or Upstash Redis free (optional)
- `bcryptjs` with 10 salt rounds
- httpOnly cookie + SameSite Lax + Secure in prod
- CSP headers in `next.config.ts`
- Escape markdown HTML (react-markdown doesn't render raw HTML by default — safe)
- Validate everything with Zod (you already have it for enquiries — reuse pattern `schemas/blog.ts`)

---

## 7. Final Recommendation

**Build Custom Admin Panel.**

- Keep your current beautiful blog UI (blog-card, featured-post, topics). Just swap data source DB, not design.
- Admin: `/admin` minimal but complete — login, list, create, edit.
- DB: MongoDB Atlas (already connected).
- Images: Cloudinary free.
- Content: Markdown (lets you use your installed MDX infra later for interactive posts).

If you want, I can start scaffolding this architecture now in this branch:
1. Models
2. Auth middleware + login
3. Admin dashboard shell
4. CRUD APIs
5. Migration of public pages

Let me know — do you want me to implement Phase 1?

---

*Author: analysis based on your current repo at commit 83c11c0e*
