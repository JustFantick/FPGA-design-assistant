# Auth Implementation Plan

**Stack**: NextAuth.js + Prisma (SQLite for dev) + Credentials & OAuth (Google, GitHub)
**API Keys**: Stored in LocalStorage (client-side only), passed to API routes per request
**Auth required**: No — anonymous users can analyze/generate, but no history

---

## Step 1 — Prisma setup

**Commit**: `chore: add prisma with sqlite and base schema`

- Install `prisma` (dev) and `@prisma/client`
- Run `npx prisma init --datasource-provider sqlite`
- Define NextAuth-required models: `User`, `Account`, `Session`, `VerificationToken`
- Add `password` field to `User` (for Credentials provider)
- Run `npx prisma migrate dev --name init`
- Create `src/lib/prisma.ts` (singleton client)
- Add `prisma/dev.db` to `.gitignore`

---

## Step 2 — NextAuth.js configuration

**Commit**: `feat: add nextauth with prisma adapter`

- Install `next-auth` and `@auth/prisma-adapter`
- Create `src/lib/auth.ts` — NextAuth config with Prisma adapter
- Create `src/app/api/auth/[...nextauth]/route.ts`
- Add `NEXTAUTH_SECRET`, `NEXTAUTH_URL` to `.env` (and `env.example`)
- Configure session strategy (jwt or database)
- Add `SessionProvider` wrapper to layout

---

## Step 3 — Credentials provider (register + login)

**Commit**: `feat: add credentials provider with registration`

- Add `bcrypt` (or `bcryptjs`) for password hashing
- Add Credentials provider in NextAuth config (email + password)
- Create `POST /api/auth/register` route — validates input, hashes password, creates user
- Create `/register` page (form: name, email, password)
- Create `/login` page (form: email, password — calls `signIn("credentials")`)

---

## Step 4 — OAuth providers (Google, GitHub)

**Commit**: `feat: add google and github oauth providers`

- Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` to `.env` / `env.example`
- Register OAuth providers in NextAuth config
- Add "Sign in with Google" / "Sign in with GitHub" buttons on `/login` page
- Handle account linking (NextAuth handles this via `Account` model)

---

## Step 5 — Auth UI integration

**Commit**: `feat: add auth ui to app layout`

- Add user avatar / sign-in button to the app header/toolbar
- Show user name + sign-out option when logged in
- Show "Sign in" link when anonymous
- Protect `/history` route (redirect to `/login` if not authenticated)
- Anonymous users can still use `/` (analyze + testbench) freely

---

## Step 6 — User API keys (LocalStorage)

**Commit**: `feat: add user api keys management via localstorage`

- Create `src/lib/apiKeys.ts` — helpers: `getApiKeys()`, `setApiKeys()`, `clearApiKeys()`
- Create Settings UI (dialog or page): fields for Anthropic key and Google AI key, save to LocalStorage
- Add "Settings" / "API Keys" button in header (visible to all users)
- Update Zustand store or context to expose current API keys

---

## Step 7 — Pass user API keys to backend

**Commit**: `feat: use user api keys in ai service calls`

- Frontend: include user API keys in request body (or headers) when calling `/api/analyze` and `/api/generate-testbench`
- Refactor `ClaudeService` / `GeminiService` constructors to accept optional `apiKey` param
- Refactor `AIServiceFactory.createService()` to accept optional API key
- In API routes: use user-provided key if present, otherwise fallback to `process.env.*`

---

## Step 8 — History model & API

**Commit**: `feat: add history model and api routes`

- Add `History` model to Prisma schema (userId, type, input, result, model, createdAt)
- Run migration
- Create `GET /api/me/history` — returns paginated history for authenticated user
- In `/api/analyze` and `/api/generate-testbench`: after success, if user is authenticated → save to History

---

## Step 9 — History UI

**Commit**: `feat: add history page`

- Create `/history` page — list of past analyses and testbenches
- Show date, model used, snippet of input code
- Click to expand / re-load into editor
- Only accessible to authenticated users

---

## Step 10 — Rate limit by user

**Commit**: `refactor: rate limit by user id for authenticated users`

- Update `getClientIdentifier`: use `userId` from session if available, else IP
- Optionally: different limits for authenticated vs anonymous

---

## Summary

| Step | Scope             | Commit prefix |
| ---- | ----------------- | ------------- |
| 1    | Prisma + SQLite   | `chore:`      |
| 2    | NextAuth config   | `feat:`       |
| 3    | Credentials auth  | `feat:`       |
| 4    | OAuth providers   | `feat:`       |
| 5    | Auth UI in layout | `feat:`       |
| 6    | API keys (LS)     | `feat:`       |
| 7    | Keys → backend    | `feat:`       |
| 8    | History model/API | `feat:`       |
| 9    | History UI        | `feat:`       |
| 10   | Rate limit update | `refactor:`   |

Confirm to start with **Step 1**.
