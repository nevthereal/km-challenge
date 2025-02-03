import { getUser } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/db';
import { club, clubAdmin, clubMember } from '$lib/db/schema';

const clubSchema = z.object({
	name: z.string().min(5)
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	const { superUser } = user;

	if (!superUser) return redirect(302, '/clubs');

	const form = await superValidate(zod(clubSchema));

	return { user, form };
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const { superUser } = user;

		if (!superUser) return redirect(302, '/clubs');

		const form = await superValidate(request, zod(clubSchema));

		if (!form.valid) return fail(400, { form });

		const [createdClub] = await db
			.insert(club)
			.values({
				name: form.data.name
			})
			.returning();

		await db.insert(clubAdmin).values({
			clubId: createdClub.id,
			userId: user.id
		});

		await db.insert(clubMember).values({
			clubId: createdClub.id,
			userId: user.id
		});

		return redirect(302, `/clubs/${createdClub.id}`);
	}
};
