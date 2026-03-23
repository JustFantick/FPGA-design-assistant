# FPGA Design Assistant

AI-powered VHDL code analysis and testbench generation web app for students and engineers.

## What it uses

- Next.js (web UI)
- NextAuth + Prisma (authentication and persistence)
- PostgreSQL (database)
- AI providers: Anthropic (Claude) and Google (Gemini)

## Prerequisites

- Node.js (LTS recommended, v22+)
- PostgreSQL running and reachable from your machine
- API keys for the AI providers you want to use

## Setup and run

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp env.example .env
```

3. Configure `.env`

At minimum, set:

- `DATABASE_URL` (Postgres connection string)
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `GITHUB_ID` / `GITHUB_SECRET` (for OAuth sign-in)
- `ANTHROPIC_API_KEY` and/or `GOOGLE_API_KEY` (for AI analysis)

4. Run Prisma migrations:

```bash
npx prisma migrate deploy
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Common commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
```

## License

MIT - Free to use, modify, and distribute.
