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

## Category migration

Blog posts now reference a `Category` document by ObjectId. Run the idempotent
migration once against databases that contain the previous embedded category
shape:

```bash
npm run migrate:categories
```

The migration creates categories from the existing post data and updates each
legacy post to use the new reference.
