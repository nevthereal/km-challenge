# Kilometer Challenge

A tool I built for my rowing club for tracking our kilometres in our holidays.

## Development

Use Node.js 22.17+ and Bun 1.4+ (the lockfile was generated with Bun 1.4.4).

```sh
bun install --frozen-lockfile
cp .env.example .env
# Fill in the database and authentication credentials in .env.
bun run dev
```

The development server uses `http://localhost:5173`. If that port belongs to another app, it fails clearly instead of silently moving to another port.

The app uses SvelteKit 3 and Svelte 5. Configuration lives in `vite.config.ts`, private environment variables are declared in `src/env.ts`, and application imports use `#lib`.

```sh
bun run check
bun run lint
bun run test:remote
bun run build
bun run start
```

The official Bun adapter requires the production build to run in Bun; the build script enforces this. Authentication uses the current localhost port during development and `https://www.km-challenge.com` in production. No base-URL environment variable is required for those origins. Set the optional `BETTER_AUTH_URL` only for preview deployments or a different public origin. Environment variables currently marked `static` in `src/env.ts` must be supplied at build time.

The remote regression suite uses isolated request/database adapters. Browser tests require an authenticated test setup; the configured Playwright `e2e` directory has not yet been created.

Better Auth was upgraded for Kit 3 support. Its Drizzle integration now uses ORM/CLI 1.0.0-rc.5 instead of the previous beta, with existing column names preserved. No database migration was applied during this upgrade.
