import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { z } from 'zod';

// Execute the real handlers with isolated request/database adapters; no production database access.
function load(file, dependencies) {
	const output = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
	}).outputText;
	const exports = {};
	new Function('require', 'exports', output)((id) => {
		if (!(id in dependencies)) throw new Error('Unexpected dependency: ' + id);
		return dependencies[id];
	}, exports);
	return exports;
}
function http(status, message) {
	throw Object.assign(new Error(message), { status });
}
function harness({ user = { id: 'user', completedProfile: true }, records = {} } = {}) {
	const calls = [];
	const db = { query: {} };
	for (const name of ['challenge', 'challengeMember', 'clubMember', 'discipline', 'entry']) {
		db.query[name] = {
			findFirst: async ({ where }) => {
				calls.push({ name, where });
				return (records[name] ?? []).find((row) =>
					Object.entries(where).every(([key, value]) => row[key] === value)
				);
			}
		};
	}
	const remote = (...args) => {
		const callback = args.at(-1);
		const fn = (...input) => callback(...input);
		return fn;
	};
	remote.batch = remote;
	const requireUser = () => {
		if (!user) http(302, 'signin');
		return user;
	};
	const handlers = load('src/lib/remote/challenges.remote.ts', {
		'$app/server': {
			command: remote,
			form: remote,
			query: remote,
			getRequestEvent: () => {
				throw Error('Page state accessed');
			}
		},
		'#lib/utils.ts': {},
		'#lib/db/index.ts': {
			db,
			checkAdmin: async () => true,
			getLeaderBoard: {
				execute: async () => {
					calls.push('leaderboard');
					return [];
				}
			}
		},
		'#lib/db/schema.ts': {},
		'#lib/zod.ts': {},
		'#lib/server/request-user.ts': {
			requireCompletedProfile: requireUser,
			requireCommandUser: requireUser,
			getCurrentUser: () => user
		},
		'drizzle-orm': {},
		'@sveltejs/kit': { error: http, redirect: http, invalid: (issue) => http(400, issue) },
		zod: { z },
		'./clubs.remote': {}
	});
	return { handlers, calls };
}
test('leaderboard denies anonymous requests before database access', async () => {
	const { handlers, calls } = harness({ user: null });
	await assert.rejects(handlers.getLeaderboard([{ challengeId: 'private', limit: 5 }]), {
		status: 302
	});
	assert.deepEqual(calls, []);
});
test('leaderboard denies nonmembers before reading scores', async () => {
	const { handlers, calls } = harness({
		records: { challenge: [{ id: 'private', clubId: 'club' }] }
	});
	await assert.rejects(handlers.getLeaderboard([{ challengeId: 'private', limit: 5 }]), {
		status: 403
	});
	assert.ok(!calls.includes('leaderboard'));
});
test('leaderboard batches limits and accepts zero rows', async () => {
	const { handlers, calls } = harness({
		records: {
			challenge: [{ id: 'c', clubId: 'club' }],
			clubMember: [{ clubId: 'club', userId: 'user' }]
		}
	});
	const resolve = await handlers.getLeaderboard([
		{ challengeId: 'c', limit: 0 },
		{ challengeId: 'c', limit: 5 }
	]);
	assert.deepEqual(resolve({ challengeId: 'c', limit: 0 }), []);
	assert.equal(calls.filter((c) => c === 'leaderboard').length, 1);
});
for (const operation of [
	'getChallengePageContext',
	'joinChallengeCommand',
	'leaveChallengeCommand',
	'deleteDisciplineCommand',
	'deleteChallengeCommand'
]) {
	test(`${operation} rejects a challenge paired with a different club`, async () => {
		const { handlers } = harness({ records: { challenge: [{ id: 'private', clubId: 'victim' }] } });
		await assert.rejects(
			handlers[operation]({ clubId: 'attacker', challengeId: 'private', disciplineId: 'd' }),
			{ status: 404 }
		);
	});
}
test('entry submission rejects a discipline from another challenge', async () => {
	const { handlers } = harness({ records: { discipline: [{ id: 'd', challengeId: 'other' }] } });
	await assert.rejects(
		handlers.createEntryForm(
			{ challengeId: 'c', disciplineId: 'd' },
			{ disciplineId: (message) => message }
		),
		{ status: 400 }
	);
});
test('authentication guards never inspect route-dependent request fields', () => {
	const event = { locals: { user: null } };
	for (const key of ['url', 'params', 'route'])
		Object.defineProperty(event, key, {
			get() {
				throw Error('Page state accessed');
			}
		});
	const guards = load('src/lib/server/request-user.ts', {
		'$app/server': { getRequestEvent: () => event },
		'@sveltejs/kit': { redirect: http, error: http }
	});
	assert.throws(() => guards.requireUser('/profile'), { status: 302 });
	event.locals.user = { id: 'user', role: null, gender: null };
	assert.throws(() => guards.requireCompletedProfile('/clubs'), { status: 302 });
});

for (const [returnTo, expected] of [
	['/clubs/abc', '/clubs/abc'],
	['https://attacker.example/phish', '/profile'],
	['//[invalid', '/profile']
]) {
	test(`profile update refreshes auth state and safely handles return URL ${returnTo}`, async () => {
		const calls = [];
		const event = {
			url: new URL('https://app.example/profile/edit'),
			request: { headers: new Headers() }
		};
		event.url.searchParams.set('redirect', returnTo);
		const form = (schema, callback) => callback;
		const handlers = load('src/lib/remote/profile.remote.ts', {
			'$app/server': { form, query: (callback) => callback, getRequestEvent: () => event },
			'@sveltejs/kit': { redirect: http, error: http },
			'#lib/auth/index.ts': { auth: { api: { updateUser: async (input) => calls.push(input) } } },
			'#lib/zod.ts': {},
			'#lib/server/request-user.ts': { requireUser: () => ({ id: 'user' }) }
		});
		await assert.rejects(
			handlers.updateProfile({ role: 'U17', username: 'Updated', gender: 'F' }),
			{ status: 303, message: expected }
		);
		assert.deepEqual(calls[0].body, { role: 'U17', name: 'Updated', gender: 'F' });
		assert.equal(calls[0].headers, event.request.headers);
	});
}

test('command auth guards return errors instead of redirects', () => {
	const event = { locals: { user: null } };
	const guards = load('src/lib/server/request-user.ts', {
		'$app/server': { getRequestEvent: () => event },
		'@sveltejs/kit': {
			redirect: () => {
				throw Error('Command redirected');
			},
			error: http
		}
	});
	assert.throws(() => guards.requireCommandUser(), { status: 401 });
	event.locals.user = { id: 'user', role: null, gender: null };
	assert.throws(() => guards.requireCommandUser(), { status: 403 });
});

for (const [user, destination] of [
	[null, '/signin'],
	[{ id: 'user', role: null, gender: null }, '/profile/edit']
]) {
	test(`invitation survives the ${destination} redirect`, async () => {
		const guards = load('src/lib/server/request-user.ts', {
			'$app/server': { getRequestEvent: () => ({ locals: { user } }) },
			'@sveltejs/kit': { redirect: http, error: http }
		});
		const route = load('src/routes/clubs/join/[code]/+page.server.ts', {
			'@sveltejs/kit': { redirect: http, error: http },
			'#lib/db/index.ts': {
				db: new Proxy(
					{},
					{
						get() {
							throw Error('Database reached before authentication');
						}
					}
				)
			},
			'#lib/db/schema.ts': {},
			'#lib/server/request-user.ts': guards
		});
		await assert.rejects(route.load({ params: { code: '123456' } }), {
			status: 302,
			message: `${destination}?redirect=${encodeURIComponent('/clubs/join/123456')}`
		});
	});
}
