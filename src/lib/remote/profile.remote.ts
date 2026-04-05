import { form, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user as userTable } from '$lib/db/schema';
import { userSetup } from '$lib/zod';
import { requireUser } from '$lib/server/request-user';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from '$app/server';

export const getProfile = query(async () => {
	return {
		user: requireUser()
	};
});

export const updateProfile = form(userSetup, async ({ role, username: name, gender }) => {
	const currentUser = requireUser();

	await db
		.update(userTable)
		.set({
			role,
			name,
			gender
		})
		.where(eq(userTable.id, currentUser.id));

	const redirectUrl = getRequestEvent().url.searchParams.get('redirect');

	redirect(303, redirectUrl || '/profile');
});
