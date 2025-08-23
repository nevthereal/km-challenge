import { db } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, getTableColumns, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	return { user };
};
