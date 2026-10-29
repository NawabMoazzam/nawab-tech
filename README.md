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

## Blog cover images

Every place a post is listed (home insights, blog index, category pages, the
featured post, related posts, the article hero and the admin lists) shows the
post's cover image. A cover can come from one of two places, chosen in the
post form under **Cover Image**:

- **Upload** — the file is uploaded to ImageKit, which stores, resizes and
  transforms it. Deleting it from the form also removes it from ImageKit.
- **Pexels / URL** — the image is used straight from its own CDN, so it costs
  no ImageKit storage. Search Pexels from the form (needs `PEXELS_API_KEY` on
  the server; the key is never exposed to the browser) or paste any image URL.

Externally hosted covers are served with that CDN's own sizing parameters, so a
post keeps loading fast without going through ImageKit or the Next.js image
optimizer.

## ## Daily automated blog post (free, GitHub Actions)

A script + GitHub Actions workflow can publish one AI-written blog post with
an AI-generated cover image every day, for free:

- `scripts/auto-blog/generate-and-publish.ts` - generates an SEO-optimized post
  using a capability-ordered Gemini API fallback chain (`gemini-3.8-flash` →
  `gemini-2.5-pro` → `gemini-3.1-pro-preview` → `gemini-3.7-flash` →
  `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3-flash-preview` →
  `gemini-2.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` →
  `gemini-2.5-flash-lite`), validates structural and on-page SEO quality before
  accepting a model's output, picks a matching cover photo from the Pexels API
  (free stock photo library, just needs a free API key) and stores that URL
  directly on the post — so daily posts use no ImageKit storage — then inserts
  the post into MongoDB with `status: "published"`.
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

Required environment variables:

```bash
MONGODB_URI=               # same value the app uses
GEMINI_API_KEY=            # https://aistudio.google.com/apikey (free)
PEXELS_API_KEY=            # https://www.pexels.com/api/ (free, no card)
BLOG_REVALIDATE_SECRET=    # any random string; must match the value on Vercel
```

Optional:

```bash
AUTO_BLOG_UPLOAD_COVER=true   # copy the Pexels photo into ImageKit instead of
                              # linking it; needs IMAGEKIT_PUBLIC_KEY,
                              # IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT
```

To run it daily for free via GitHub Actions, add these as **GitHub repo
secrets** (Settings → Secrets and variables → Actions):

```
MONGODB_URI
GEMINI_API_KEY
PEXELS_API_KEY
NEXT_PUBLIC_BASE_URL
BLOG_REVALIDATE_SECRET
```

Add `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` and
`AUTO_BLOG_UPLOAD_COVER=true` only if you want the daily cover uploaded to
ImageKit instead of linked from Pexels.

And add `BLOG_REVALIDATE_SECRET` (same value) as a Vercel environment
variable too, so `/api/revalidate` accepts the script's request.

### Gemini troubleshooting

- The script sanitizes `GEMINI_API_KEY` by trimming whitespace, surrounding
  quotes, and an optional `Bearer` prefix. In GitHub Actions, store the Google
  AI Studio API key itself as the secret; don't include a `Bearer` prefix.
- Each run checks the key with Gemini's `models.list` endpoint before opening a
  MongoDB connection. If this preflight fails, verify the key is valid, belongs
  to the intended Google project, and is allowed to use the Gemini API. Update
  the `GEMINI_API_KEY` Actions secret, then rerun the workflow.
- A `401 ACCESS_TOKEN_TYPE_UNSUPPORTED` from one model is treated as a
  model-specific rejection, so the script advances through the fallback chain
  instead of stopping the run. If every model is rejected, check the key and
  its Gemini API access.
- The complete generation/fallback chain has an eight-minute budget. If that
  budget is exhausted, review the Actions log for the models and retry delays
  that consumed the time. `GEMINI_MODEL` and `GEMINI_MODELS` can put preferred
  models first in the chain.

## Category migration

Blog posts now reference a `Category` document by ObjectId. Run the idempotent
migration once against databases that contain the previous embedded category
shape:

```bash
npm run migrate:categories
```

The migration creates categories from the existing post data and updates each
legacy post to use the new reference.


## Facebook Page automation

Two independent GitHub Actions workflows can publish to the Nawab Tech Facebook Page:

- `.github/workflows/daily-blog.yml` — generates the daily blog at 08:00 Pakistan time, then shares the newly published article link on Facebook.
- `.github/workflows/daily-facebook-content.yml` — creates a separate English Facebook caption and a branded 1200×1200 template graphic (no AI image generation) at 17:00 Pakistan time.

Both workflows can also be run manually from **GitHub → Actions → select workflow → Run workflow**. The independent workflow installs ImageMagick on its temporary runner to render the branded SVG card to PNG. No extra npm package is needed.

Add these repository secrets in **Settings → Secrets and variables → Actions**:

```
META_PAGE_ID
META_PAGE_ACCESS_TOKEN
```

The existing `MONGODB_URI` and `GEMINI_API_KEY` secrets are reused. The blog workflow also uses the existing blog-generation secrets. `META_PAGE_ACCESS_TOKEN` must be a valid Page access token authorized to publish to that Page; do not put it in source code or a public environment variable. The Page ID is not a secret, but the workflow reads it from a secret for simpler setup.

Optional repository variable:
- `META_GRAPH_API_VERSION` — Graph API version, defaults to `v26.0` in the shared publisher if this variable is empty.

The scripts store publication history in MongoDB's `socialpublishes` collection so reruns can avoid reposting already-published blog links or that day's independent post. A successful Facebook publish requires the Page token and the relevant Meta app/Page permissions to be configured correctly.
