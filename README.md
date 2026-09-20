# Nawab Tech

Next.js website and admin blog CMS.

## Admin environment

The admin and password-reset flows require these runtime variables:

```bash
MONGODB_URI=
BETTER_AUTH_SECRET=
NEXT_PUBLIC_BASE_URL=https://your-domain.example
RESEND_API_KEY=
FROM_EMAIL="Nawab Tech <admin@your-domain.example>"
```

`BETTER_AUTH_URL` can be used instead of `NEXT_PUBLIC_BASE_URL`, and
`RESEND_FROM_EMAIL` can be used specifically for password-reset mail instead of
`FROM_EMAIL`.

Public email/password sign-up is disabled, so an existing Better Auth account
is required. `npm run seed:admin -- admin@example.com` can mark that account
with the `admin` role.

## Daily automated blog post (free, GitHub Actions)

A script + GitHub Actions workflow can publish one AI-written blog post with
an AI-generated cover image every day, for free:

- `scripts/auto-blog/generate-and-publish.ts` - generates a post with the
  Gemini API (free tier), picks a matching cover photo from the Pexels API
  (free stock photo library, just needs a free API key), uploads it to
  ImageKit, and inserts the post directly into MongoDB with
  `status: "published"`.
- `.github/workflows/daily-blog.yml` - runs that script once a day on
  GitHub Actions' free scheduler.
- `app/api/revalidate` - a secret-protected endpoint the script pings after
  publishing so the new post appears immediately instead of waiting for the
  hourly ISR refresh.

Run it locally first (safe, does not write to the DB):

```bash
DRY_RUN=true npm run auto-blog
```

Then for a real run:

```bash
npm run auto-blog
```

Required environment variables (same MongoDB/ImageKit values already used by
the app), plus:

```bash
GEMINI_API_KEY=            # https://aistudio.google.com/apikey (free)
PEXELS_API_KEY=            # https://www.pexels.com/api/ (free, no card)
BLOG_REVALIDATE_SECRET=    # any random string; must match the value on Vercel
```

To run it daily for free via GitHub Actions, add these as **GitHub repo
secrets** (Settings → Secrets and variables → Actions):

```
MONGODB_URI
GEMINI_API_KEY
PEXELS_API_KEY
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_URL_ENDPOINT
NEXT_PUBLIC_BASE_URL
BLOG_REVALIDATE_SECRET
```

And add `BLOG_REVALIDATE_SECRET` (same value) as a Vercel environment
variable too, so `/api/revalidate` accepts the script's request.

## Category migration

Blog posts now reference a `Category` document by ObjectId. Run the idempotent
migration once against databases that contain the previous embedded category
shape:

```bash
npm run migrate:categories
```

The migration creates categories from the existing post data and updates each
legacy post to use the new reference.
