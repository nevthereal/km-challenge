import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser(locals, '/');

	if (user) return redirect(302, url.searchParams.get('redirect') || '/');
};
