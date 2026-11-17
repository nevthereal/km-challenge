# SvelteKit remote functions audit

## SvelteKit 3 upgrade follow-up

The project has subsequently been migrated with the official `sv migrate sveltekit-3` workflow and manual compatibility fixes. Current versions: SvelteKit 3.2.0, Svelte 5.57.3, Vite 8.3.8, Vite Svelte plugin 7.3.1, TypeScript 6.0.3, official Bun adapter 1.0.1, Svelte checker 4.7.8, ESLint Svelte plugin 3.24.1, Prettier 3.10.1 and Svelte formatter plugin 4.1.1.

Configuration now lives in `vite.config.ts`; `#lib` imports have explicit extensions; the TypeScript config extends `$app/tsconfig`; environment variables are declared in `src/env.ts`. The old third-party Bun adapter has been removed. Node 22.17+ and Bun 1.4+ are required; `packageManager` specifies Bun 1.4.4. The build script runs Vite with Bun as required by the official adapter.

Custom remote-form enhance handlers now receive the typed form instance, call `form.submit()`, and reset through `form.element.reset()`. Hidden challenge IDs use `fields.challengeId.as('hidden', ...)`, as Kit 3 requires generated field attributes. Command authentication now uses HTTP 401/403 errors rather than unsupported redirects. Test mocks follow the migrated import paths.

The dependency/tooling blockers recorded below are historical: Sonner now type-checks, the Svelte parser supports boundaries, async compilation is enabled for linting, and the formatter works. The checker is explicitly pointed at `vite.config.ts` so ignored dependency source fixtures are not loaded. Lint cleanup adds stable list keys, resolved application navigation links and TypeScript parsing for Svelte modules.

Tailwind and its Vite plugin were updated to 4.3.5 for Vite 8 support. Better Auth was updated to 1.7.25 for its Kit 3 peer support; its compatible Drizzle ORM and CLI are 1.0.0-rc.5 (replacing the previous 1.0 beta). Drizzle's removed client/CLI casing setting was moved to `pgTableCreator` with snake_case, preserving all database identifiers. A regression test checks every table's column names. No database push, migration or schema mutation was run.

### Current verification

- `bun install --frozen-lockfile`: passes after a clean dependency install.
- `bun run check`: zero errors and zero warnings.
- `bun run lint`: passes Prettier and ESLint across the repository.
- `bun run test:remote`: all 26 handler/schema tests pass.
- `bun run build`: passes with the official Bun adapter.
- Built server HTTP smoke test: auth health endpoint returns 200; anonymous home renders with 200; protected profile redirects to sign-in. The temporary server was stopped after verification.
- `git diff --check`: passes.
- The Svelte autofixer found no component errors in the manually adjusted components. Existing form-field API calls and initialization effects were retained after reviewing its general suggestions.

Verification used temporary supported Node 22 and Bun 1.4.4 executables, without changing the system runtime installations. Authentication no longer requires the custom `BETTER_AUTH_BASE_URL` variable. Development uses an explicit localhost host allowlist with the current port; production uses `https://www.km-challenge.com`. The standard `BETTER_AUTH_URL` is an optional runtime override for other deployments. Base-URL resolution and untrusted-host rejection are covered by tests. Authenticated browser and live-database flows remain untested.

The sections below document the original audit before this upgrade.

---

Reviewed all 29 remote exports in `src/lib/remote`, their component callers, request-user guards, session hook, validation schemas, database projections, and framework configuration.

## Version context

The manifest requests SvelteKit ^2.55.0 and Svelte ^5.55.1; this checkout has Kit 2.52.0 and Svelte 5.51.2 installed. The installed ESLint Svelte plugin is 2.46.1 although the manifest requests ^3.16.0. Findings were checked against official documentation and the installed framework implementation. The implementation keeps the existing Kit 2 configuration and enhance callback API. Current Kit 3 examples are not a drop-in migration for this checkout.

## Fixed findings

| Finding                                                                                        | Resolution                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leaderboard query was callable without authentication or club membership                       | Require a completed profile and membership in the challenge's actual club before reading scores; preserve batching of repeated challenge IDs.                                                                                                  |
| Caller-supplied club and challenge IDs were not consistently related                           | Challenge queries, membership commands, discipline administration and challenge edits/deletion validate the club/challenge relationship.                                                                                                       |
| Challenge creation relied on a global Coach/admin flag                                         | Also require administration rights for the target club, matching the existing UI.                                                                                                                                                              |
| Entry submission accepted a discipline belonging to another challenge                          | Reject the discipline with a field validation issue.                                                                                                                                                                                           |
| Other users' full account records and the session token were returned to the browser           | Select public competitor fields for leaderboard/activity/member responses; return only session expiry for the navigation's session-presence check. The current user's own profile remains available.                                           |
| Request-user helpers read the current URL inside queries                                       | Return destinations are explicit, encoded arguments with defaults; guards no longer read route-dependent request properties.                                                                                                                   |
| Partial form refresh lists suppressed default invalidation and missed dependent query variants | Remove partial server refresh lists from forms and use Kit's default invalidation.                                                                                                                                                             |
| Commands left related data stale                                                               | Membership and deletion commands refresh affected parent/list queries. Entry and discipline deletion callers await `refreshAll()` to cover every active leaderboard limit and member detail variant. Commands do not invalidate automatically. |
| Top-level awaited snapshots did not subscribe to refreshes                                     | Home, navigation, club list and profile display use derived awaits, including derived profile list items. Profile-edit initialization remains a one-time draft initialization.                                                                 |
| Direct profile DB writes bypassed Better Auth's cookie cache                                   | Use `auth.api.updateUser` and the official SvelteKit cookies plugin; constrain redirect targets to the application's origin, including a malformed-URL fallback.                                                                               |
| Discipline input accepted empty batches/names and nonpositive factors                          | Strengthen Standard Schema validation; insert the whole discipline batch in one SQL statement to avoid partial success.                                                                                                                        |
| Empty challenges passed a zero leaderboard limit rejected by the schema                        | Accept nonnegative integer limits.                                                                                                                                                                                                             |

## Correct patterns retained

- Remote exports use `.remote.ts` modules and `$app/server` factories.
- All functions accepting input use Zod Standard Schemas; none uses unchecked validation.
- Queries perform reads and mutations use forms or commands.
- Route-specific query callers use derived argument objects; challenge pages render query results within boundaries.
- Remote forms use generated field attributes (including numeric coercion), field issues, keyed form instances and remote-form enhancement rather than `$app/forms` enhancement.
- Existing custom enhance handlers await submission and preserve invalid fields before closing dialogs.
- `query.batch` returns a resolver function and coalesces repeated challenge IDs with different limits.
- Request authentication is populated in the server hook; handlers independently check authorization.
- No prerendered page uses these authenticated queries; dynamic data is not moved into prerender functions.

## Verification

- `bun run test:remote`: 13 passing isolated handler tests. Covers anonymous/nonmember leaderboard access, batching/zero limits, mismatched club/challenge IDs, cross-challenge disciplines, route-independent guards, profile auth API updates and safe redirects. Adapters are mocked: these tests do not exercise the network transport, cookies in a browser or PostgreSQL.
- Official Svelte autofixer: no issues or suggestions for changed components.
- `BETTER_AUTH_BASE_URL=http://localhost:5173 bun run build`: passes, including client/server compilation and Bun adapter output. The variable was supplied only for this process; no environment file was changed and no site was deployed.
- `bun run check`: normal invocation is blocked by missing `BETTER_AUTH_BASE_URL` and the existing Sonner `mode.current` type error. Supplying the temporary base URL leaves only the Sonner error, with zero warnings. The checker also scans ignored dependency source fixtures in `opensrc/` and reports their missing optional packages.
- Targeted ESLint: remote TypeScript files pass after unused-import cleanup. Component checking is blocked by existing tooling configuration/version issues: async compilation is not enabled in ESLint and the installed parser does not understand Svelte boundaries.
- Prettier formats the changed TypeScript and test files. Its installed Svelte plugin combination crashes with `getVisitorKeys is not a function` on components; component edits retain their surrounding formatting.
- `git diff --check`: passes.
- The configured Playwright `e2e` directory does not exist. No authenticated end-to-end or production-data mutation tests were run.

## Adjacent observations

The existing invitation URL's `+page.server.ts` inserts club membership during a GET load. This is outside the remote-function handlers, but merits a separate change to a confirmation form/POST so link prefetching cannot join a club. Challenge context queries also load the full challenge entry graph; large challenges may benefit from smaller context projections and aggregate queries. Neither requires adopting newer remote-function APIs.

## References

- https://svelte.dev/docs/kit/remote-functions
- Installed Kit implementation: `node_modules/@sveltejs/kit/src/runtime/app/server/remote` and `src/runtime/client/remote-functions`
- https://better-auth.com/docs/integrations/svelte-kit
- Installed Better Auth update handler: `node_modules/better-auth/dist/api/routes/update-user.mjs`
