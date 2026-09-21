# Blog Posts API

REST API for programmatically managing blog posts. Backed by Next.js App Router
route handlers in `src/app/api/posts/` and persisted to MongoDB via
`src/lib/posts.ts`.

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production  | `https://gokulakannan.dev` |
| Local dev   | `http://localhost:3000` |

All routes below are relative to the base URL.

## Authentication

Two mechanisms are accepted; either one authorizes a request:

1. **API key** (for external scripts) — send a bearer token that matches the
   `API_SECRET_KEY` environment variable:

   ```
   Authorization: Bearer <API_SECRET_KEY>
   ```

   Generate a key with `openssl rand -hex 32` and set it in `.env.local`. If
   `API_SECRET_KEY` is unset on the server, key-based auth is disabled and only
   session auth works. Implemented in `hasValidApiKey()`
   (`src/app/api/posts/route.ts:6`).

2. **Admin session** (browser) — a logged-in Auth.js session cookie, used by the
   admin UI. Not relevant for external scripts.

Write operations (`POST`, `PUT`, `DELETE`) require auth. Reads are public but
only return **published** posts unless the request is authenticated, in which
case drafts are included too.

## Data model

`PostFrontmatter` + `content` (`src/lib/posts.ts:4`):

| Field       | Type       | Required | Notes |
|-------------|------------|----------|-------|
| `slug`      | string     | yes      | URL identifier. Must match `^[a-z0-9][a-z0-9-]{0,100}$` (lowercase alphanumeric + hyphens, ≤101 chars). |
| `title`     | string     | yes      | Post title. |
| `date`      | string     | no       | Publication date, e.g. `2026-07-29`. |
| `tags`      | string[]   | no       | Defaults to `[]`. |
| `excerpt`   | string     | no       | Short summary. Defaults to `""`. |
| `published` | boolean    | no       | `false` = draft (hidden from public reads). Defaults to `false`. |
| `content`   | string     | no       | Post body in Markdown. Defaults to `""`. |

## Endpoints

### `GET /api/posts`

List posts (metadata only, no `content`), sorted newest first. Public callers
see published posts only; authenticated callers also see drafts.

**Responses**
- `200` — JSON array of `PostFrontmatter`.

```bash
curl https://gokulakannan.dev/api/posts
```

---

### `POST /api/posts`

Create or update (upsert) a post. Posting an existing `slug` overwrites it.

**Auth:** required.

**Body:** `PostFrontmatter` + `content` (see data model). `slug` and `title` are
required.

**Responses**
- `201` — `{ "slug": "<slug>" }`
- `400` — `{ "message": "slug and title are required." }` or `{ "message": "Invalid slug format." }`
- `401` — `{ "message": "Unauthorized." }`
- `500` — `{ "message": "<error>" }`

```bash
curl -X POST https://gokulakannan.dev/api/posts \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "slug": "hello-world",
        "title": "Hello World",
        "date": "2026-07-29",
        "tags": ["intro"],
        "excerpt": "First post",
        "published": true,
        "content": "# Hi\n\nBody in **markdown**."
      }'
```

---

### `GET /api/posts/{slug}`

Fetch a single post including `content`. Drafts (`published: false`) return
`404` unless the request is authenticated.

**Responses**
- `200` — `Post` object (`PostFrontmatter` + `content`).
- `400` — `{ "message": "Invalid slug." }`
- `404` — `{ "message": "Not found." }`

```bash
curl https://gokulakannan.dev/api/posts/hello-world
```

---

### `PUT /api/posts/{slug}`

Update a post. Functionally an upsert like `POST`, but the slug comes from the
URL path.

**Auth:** required.

**Body:** `PostFrontmatter` + `content`.

**Responses**
- `200` — `{ "slug": "<slug>" }`
- `400` — `{ "message": "Invalid slug." }`
- `401` — `{ "message": "Unauthorized." }`
- `500` — `{ "message": "<error>" }`

```bash
curl -X PUT https://gokulakannan.dev/api/posts/hello-world \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello World (edited)","date":"2026-07-29","tags":["intro"],"excerpt":"Updated","published":true,"content":"# Updated body"}'
```

---

### `DELETE /api/posts/{slug}`

Delete a post.

**Auth:** required.

**Responses**
- `200` — `{ "ok": true }`
- `400` — `{ "message": "Invalid slug." }`
- `401` — `{ "message": "Unauthorized." }`

```bash
curl -X DELETE https://gokulakannan.dev/api/posts/hello-world \
  -H "Authorization: Bearer $API_SECRET_KEY"
```

## Notes & side effects

- After any successful write, `/blog` and `/blog/{slug}` are revalidated
  (`revalidatePath`) so the static pages reflect the change.
- `POST` and `PUT` are both upserts (`savePost` uses `findOneAndUpdate` with
  `upsert: true`), so they are idempotent per slug and safe to retry.
- A machine-readable version of this spec is in
  [`docs/blog-api.openapi.yaml`](./blog-api.openapi.yaml).
