import { building, dev } from '$app/environment';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export async function handle({ event, resolve }) {
	const host = event.request.headers.get('host');

	if (host === 'km-challenge.com' && !dev) {
		throw redirect(301, `https://www.km-challenge.com${event.url.pathname}${event.url.search}`);
	}

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	return svelteKitHandler({ event, resolve, auth, building });
}
