import { createProjectSchema } from '$lib/zod';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	const createForm = await superValidate(zod(createProjectSchema));

	return { createForm };
};
