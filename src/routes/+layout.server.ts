import { getUser } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await getUser(request);
	return { session };
};
