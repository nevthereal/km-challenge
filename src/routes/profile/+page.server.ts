import { getUser } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	return { user };
};
