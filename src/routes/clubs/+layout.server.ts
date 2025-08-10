import { getUser } from '$lib/auth.remote';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const user = await getUser(url.pathname);

	if (!user.completedProfile) return redirect(302, `/profile/edit?redirect=${url.pathname}`);
};
