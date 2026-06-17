# Portfolio Frontend/Backend Architecture

## Current State

The application is a TanStack Start React portfolio app. The main page is implemented in `src/routes/index.tsx`, and most portfolio content is currently hard-coded in that route:

- `experience`
- `projects`
- `stack`
- `certifications`
- `proficiency`
- page metadata
- hero/profile copy

The app already has server capability through TanStack Start:

- `src/server.ts` wraps the TanStack server entry and normalizes SSR errors.
- `src/start.ts` defines request middleware.
- `src/lib/api/example.functions.ts` shows the current `createServerFn` pattern.

The target architecture should preserve the existing React/TanStack Start app, but separate the public UI from dynamic data management.

## Target Split

```text
portfolio/
  src/
    app/                  # frontend app shell helpers
    routes/               # public and admin routes
    components/           # reusable UI and page components
    features/             # domain-oriented frontend modules
    lib/
      api/                # server functions and client query wrappers
      server/             # backend-only services, repositories, auth, db
      shared/             # shared schemas, DTOs, constants
    assets/               # static imported media
  docs/
    application-architecture.md
```

This keeps one deployable TanStack Start application for now, with a clear internal frontend/backend boundary. A separate backend service can be extracted later if needed, without changing the public UI contracts.

## Frontend Architecture

### Responsibilities

The frontend should only handle:

- rendering pages and components
- local UI state such as loader, animation readiness, active section, scroll progress
- calling typed server functions
- optimistic UI for admin edits where useful

It should not own portfolio data directly.

### Proposed Frontend Layout

```text
src/features/portfolio/
  components/
    HeroSection.tsx
    ProjectGrid.tsx
    ExperienceTimeline.tsx
    StackSection.tsx
    CertificationsSection.tsx
    ConnectSection.tsx
    PageLoader.tsx
  hooks/
    useActiveSection.ts
    useClock.ts
    useHeroTyping.ts
    useScrollProgress.ts
    useScrollReveal.ts
  queries.ts

src/features/admin/
  components/
    ProjectEditor.tsx
    ExperienceEditor.tsx
    SkillEditor.tsx
  routes/
    AdminDashboard.tsx
```

`src/routes/index.tsx` should become a thin route that loads portfolio data and composes section components.

### Public Route Data Flow

```text
src/routes/index.tsx
  -> useSuspenseQuery/getPortfolioQueryOptions()
    -> getPortfolio()
      -> backend service
        -> repository
          -> database or local JSON seed
```

The route should receive one normalized `PortfolioPageData` object instead of importing multiple local arrays.

## Backend Architecture

### Responsibilities

The backend layer should handle:

- portfolio content retrieval
- content validation
- admin mutations
- persistence
- auth checks for admin-only operations
- media metadata, if images become editable

### Proposed Backend Layout

```text
src/lib/shared/portfolio.schema.ts
src/lib/shared/portfolio.types.ts

src/lib/server/db/
  client.server.ts
  schema.server.ts
  seed.server.ts

src/lib/server/repositories/
  portfolio.repository.server.ts

src/lib/server/services/
  portfolio.service.server.ts
  admin-auth.service.server.ts

src/lib/api/
  portfolio.functions.ts
  admin-portfolio.functions.ts
```

Use `.server.ts` for modules that must never ship to the browser.

### Server Function Boundary

Public read functions:

```text
getPortfolio()
getProjects()
getExperience()
```

Admin mutation functions:

```text
upsertProject(input)
deleteProject(id)
upsertExperience(input)
deleteExperience(id)
updateProfile(input)
updateStack(input)
updateCertifications(input)
```

All inputs and outputs should be validated with `zod` schemas from `src/lib/shared/portfolio.schema.ts`.

## Data Model

### Portfolio Page

```ts
type PortfolioPageData = {
  profile: Profile;
  hero: HeroContent;
  stats: Stat[];
  projects: Project[];
  experience: Experience[];
  stack: StackGroup[];
  certifications: Certification[];
  proficiency: Proficiency[];
  contact: ContactInfo;
  seo: SeoMetadata;
};
```

### Core Entities

```ts
type Project = {
  id: string;
  code: string;
  title: string;
  client: string;
  year: string;
  blurb: string;
  imageKey: string;
  tags: string[];
  link?: string;
  featured: boolean;
  sortOrder: number;
};

type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  bullets: string[];
  sortOrder: number;
};

type StackGroup = {
  id: string;
  label: string;
  items: string[];
  sortOrder: number;
};
```

## Persistence Strategy

Use a staged approach.

### Phase 1: Typed Local Data Module

Move hard-coded arrays out of `src/routes/index.tsx` into a backend-owned seed module:

```text
src/lib/server/data/portfolio.seed.server.ts
```

Expose the data through `createServerFn`.

This gives the frontend/backend separation immediately without introducing database risk.

### Phase 2: File-Based Dynamic Data

Store editable portfolio content as JSON:

```text
data/portfolio.json
```

The repository reads/writes JSON on the server. This is simple and enough for a personal portfolio admin flow.

### Phase 3: Database

Move persistence to SQLite/Postgres when concurrent edits, audit history, or multi-user admin become real requirements.

Recommended initial database path:

- SQLite with Drizzle for local/self-hosted deployments
- Postgres with Drizzle if deployed to a platform with managed database support

## API Contract

### Public Portfolio Read

```ts
export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  return portfolioService.getPublishedPortfolio();
});
```

### Admin Project Update

```ts
export const upsertProject = createServerFn({ method: "POST" })
  .inputValidator(projectInputSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    return portfolioService.upsertProject(data);
  });
```

## Admin Architecture

Add admin routes under:

```text
src/routes/admin.tsx
src/routes/admin/
  index.tsx
  projects.tsx
  experience.tsx
  stack.tsx
  profile.tsx
```

Admin pages should use the same shared schemas and server functions as the public app.

Minimum admin features:

- edit profile and hero copy
- reorder projects
- add/edit/delete projects
- add/edit/delete experience entries
- edit stack groups
- edit certifications
- preview published page

Auth can start with a single environment-protected admin password/session, then be replaced with a proper identity provider later.

## Media Handling

Current project images are imported from `src/assets`. Keep this in phase 1 by mapping `imageKey` to imported assets on the frontend:

```ts
const projectImageMap = {
  banking: projectBanking,
  devtools: projectDevtools,
  bentley: projectBentley,
  fnol: projectFnol,
};
```

Later, editable media can move to:

```text
public/uploads/
```

or an object storage provider. Store only media metadata and URLs in portfolio data.

## Environment Variables

Suggested variables:

```text
PORTFOLIO_STORAGE_MODE=json | database
PORTFOLIO_DATA_FILE=./data/portfolio.json
ADMIN_SESSION_SECRET=...
ADMIN_PASSWORD_HASH=...
DATABASE_URL=...
```

Keep env reads in server-only modules, following the existing `src/lib/config.server.ts` pattern.

## Migration Plan

1. Extract current page data into shared schemas and a server seed.
2. Create `getPortfolio` server function.
3. Refactor `src/routes/index.tsx` into smaller components and load data through the server function.
4. Add repository/service layers behind the server function.
5. Add JSON persistence.
6. Add admin routes and mutation functions.
7. Add auth middleware for admin mutations.
8. Add tests for schemas, repository behavior, and server functions.

## Testing Strategy

Recommended focused coverage:

- schema validation for all portfolio entities
- service sorting and filtering behavior
- repository read/write behavior
- public page renders when data is missing optional fields
- admin mutation rejects invalid input
- admin mutation rejects unauthenticated requests

## First Implementation Step

Start with the lowest-risk split:

```text
src/lib/shared/portfolio.schema.ts
src/lib/server/data/portfolio.seed.server.ts
src/lib/server/services/portfolio.service.server.ts
src/lib/api/portfolio.functions.ts
src/features/portfolio/queries.ts
```

Then refactor `src/routes/index.tsx` to consume `PortfolioPageData` from `getPortfolio`.
