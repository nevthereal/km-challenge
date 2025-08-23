import { getUser } from '$lib/remote/auth.remote';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
const clubSchema = z.object({
	name: z.string().min(5)
});

export const load: PageServerLoad = async () => {
	const user = await getUser();

	const { superUser } = user;

	if (!superUser) return redirect(302, '/clubs');

	const form = await superValidate(zod(clubSchema));

	return { user, form };
};
