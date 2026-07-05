# Portfolio API Reference

The portfolio exposes a REST API for reading portfolio data and managing blog posts. The API is built on Next.js Route Handlers and backed by a SQLite database (`data/portfolio.db`).

---

## Authentication

Two authentication methods are supported depending on the operation.

### Session (Admin Portal)

Used by the admin UI at `/admin`. A session is established by logging in with the admin password at `/admin/login`. Session tokens are issued as JWTs via Auth.js.

### API Key (External Clients)

For programmatic access — scripts, CI pipelines, or external publishing tools — pass the API key in the `Authorization` header:

```
Authorization: Bearer <API_SECRET_KEY>
```

Set `API_SECRET_KEY` in your `.env.local`. Generate a secure key with:

```bash
openssl rand -hex 32
```

API key auth is supported on all Posts endpoints. The Portfolio write endpoint requires a session.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | Yes | Password for the admin portal login |
| `AUTH_SECRET` | Yes | Secret used to sign Auth.js JWTs. Generate with `openssl rand -base64 32` |
| `DATABASE_URL` | No | Path to the SQLite database file. Defaults to `./data/portfolio.db` |
| `API_SECRET_KEY` | No | API key for external access to the Posts API. If unset, API key auth is disabled |

---

## Posts API

Base path: `/api/posts`

### List posts

```
GET /api/posts
```

Returns all published posts. When authenticated (session or API key), draft posts are included.

**Response**

```json
[
  {
    "slug": "my-post",
    "title": "My Post",
    "date": "2026-06-26",
    "tags": ["OutSystems", "Architecture"],
    "excerpt": "Short summary of the post.",
    "published": true
  }
]
```

---

### Get a post

```
GET /api/posts/:slug
```

Returns the full post including MDX content. Public — no auth required.

**Response**

```json
{
  "slug": "my-post",
  "title": "My Post",
  "date": "2026-06-26",
  "tags": ["OutSystems"],
  "excerpt": "Short summary.",
  "published": true,
  "content": "# Hello\n\nMDX body here."
}
```

**404** — post with that slug does not exist.

---

### Create a post

```
POST /api/posts
Authorization: Bearer <API_SECRET_KEY>
Content-Type: application/json
```

Creates a new post. If a post with the same `slug` already exists it is overwritten.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Yes | URL-safe identifier, e.g. `my-first-post` |
| `title` | string | Yes | Post title |
| `date` | string | Yes | Publication date in `YYYY-MM-DD` format |
| `tags` | string[] | No | List of topic tags |
| `excerpt` | string | No | Short summary shown in post listings |
| `published` | boolean | No | Set to `true` to make the post publicly visible. Defaults to `false` |
| `content` | string | No | Full post body in MDX format |

**Example**

```bash
curl -X POST https://your-domain.com/api/posts \
  -H "Authorization: Bearer <API_SECRET_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "outsystems-tips",
    "title": "5 OutSystems Tips I Wish I Knew Earlier",
    "date": "2026-06-26",
    "tags": ["OutSystems", "Tips"],
    "excerpt": "Practical patterns from 8 years of OutSystems projects.",
    "published": true,
    "content": "## Tip 1\n\nYour MDX content here."
  }'
```

**Response — 201 Created**

```json
{ "slug": "outsystems-tips" }
```

**400** — `slug` or `title` missing.  
**401** — no valid session or API key.

---

### Update a post

```
PUT /api/posts/:slug
Authorization: Bearer <API_SECRET_KEY>
Content-Type: application/json
```

Replaces all fields of an existing post. The `slug` in the URL is the identifier — the body should not include a different slug.

**Request body** — same shape as the create request.

**Response — 200 OK**

```json
{ "slug": "outsystems-tips" }
```

**401** — no valid session or API key.

---

### Delete a post

```
DELETE /api/posts/:slug
Authorization: Bearer <API_SECRET_KEY>
```

Permanently deletes a post from the database.

**Response — 200 OK**

```json
{ "ok": true }
```

**401** — no valid session or API key.

---

## Portfolio API

Base path: `/api/portfolio`

Exposes the full portfolio dataset (profile, projects, experience, stack, certifications, etc.) that powers the main page.

### Read portfolio data

```
GET /api/portfolio
```

Public — no auth required. Returns the complete portfolio object.

**Response** — see `data/portfolio.json` for the full shape, or the Zod schema at `src/lib/shared/portfolio.schema.ts`.

---

### Update portfolio data

```
POST /api/portfolio
Content-Type: application/json
```

Requires an active admin session. Replaces the entire portfolio dataset after validating the payload against the schema.

**Response — 200 OK** — the validated and saved portfolio object.  
**400** — payload failed schema validation.  
**401** — no active session.

---

## Database

Data is stored in a SQLite file at `data/portfolio.db` (configurable via `DATABASE_URL`).

The database is auto-initialized on first boot — no migration step is needed when running the app for the first time.

To populate the database from existing `data/portfolio.json` and `content/posts/*.mdx` files:

```bash
npm run db:seed
```

### Schema

**`portfolio` table** — single row (id = 1) holding the full portfolio JSON.

| Column | Type | Description |
|---|---|---|
| `id` | integer | Always `1` |
| `data` | text | Full portfolio object as JSON |
| `updated_at` | text | ISO 8601 timestamp of last save |

**`posts` table** — one row per blog post.

| Column | Type | Description |
|---|---|---|
| `id` | integer | Auto-increment primary key |
| `slug` | text | Unique URL identifier |
| `title` | text | Post title |
| `date` | text | Publication date (`YYYY-MM-DD`) |
| `tags` | text | JSON array of tag strings |
| `excerpt` | text | Short summary |
| `content` | text | Full MDX body |
| `published` | integer | `1` = public, `0` = draft |
| `created_at` | text | ISO 8601 creation timestamp |
| `updated_at` | text | ISO 8601 last-updated timestamp |
