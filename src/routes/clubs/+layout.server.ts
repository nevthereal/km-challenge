import { getUser } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	if (!user.completedProfile) return redirect(302, `/profile/edit?redirect=${url.pathname}`);
};
