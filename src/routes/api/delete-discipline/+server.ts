import { db } from '$lib/db';
import { discipline } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser(locals, url.pathname);

	if (!user.superUser) return error(401, 'Not an Admin');

	const dId = url.searchParams.get('id');

	if (!dId) return error(400, 'No ID provided');

	await db.delete(discipline).where(eq(discipline.id, dId));

	return new Response('success');
};
