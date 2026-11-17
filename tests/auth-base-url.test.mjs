import { test } from 'node:test';
import assert from 'node:assert/strict';
import { betterAuth } from 'better-auth';
import { getAuthBaseURL } from '../src/lib/auth/base-url.ts';

const secret = 'local-test-secret-at-least-thirty-two-characters';

for (const origin of ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5199']) {
	test(`development auth resolves ${origin} without an environment variable`, async () => {
		const auth = betterAuth({ baseURL: getAuthBaseURL(true), secret });
		const response = await auth.handler(new Request(`${origin}/api/auth/get-session`));
		assert.equal(response.status, 200);
		assert.equal(await response.json(), null);
		const session = await auth.api.getSession({
			headers: new Headers({ host: new URL(origin).host })
		});
		assert.equal(session, null);
	});
}

test('production uses the canonical origin without an environment variable', () => {
	assert.equal(getAuthBaseURL(false).fallback, 'https://www.km-challenge.com');
});

test('an explicit origin overrides development and production defaults', () => {
	for (const dev of [true, false])
		assert.equal(getAuthBaseURL(dev, 'https://preview.example.com'), 'https://preview.example.com');
});

test('development auth rejects unlisted request hosts', async () => {
	const auth = betterAuth({ baseURL: getAuthBaseURL(true), secret });
	await assert.rejects(
		auth.api.getSession({ headers: new Headers({ host: 'untrusted.example' }) }),
		/not in the allowed hosts list/
	);
});

for (const host of [
	'km-challenge.com',
	'www.km-challenge.com',
	'km-challenge-preview.vercel.app'
]) {
	test(`production auth accepts ${host}`, async () => {
		const auth = betterAuth({ baseURL: getAuthBaseURL(false), secret });
		const response = await auth.handler(new Request(`https://${host}/api/auth/get-session`));
		assert.equal(response.status, 200);
		assert.equal(await response.json(), null);
		const context = await auth.$context;
		assert.ok(context.trustedOrigins.includes('https://*.vercel.app'));
	});
}
