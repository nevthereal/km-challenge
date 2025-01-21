import { getUser } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = getUser(locals, '/profile');

	return { user };
};
