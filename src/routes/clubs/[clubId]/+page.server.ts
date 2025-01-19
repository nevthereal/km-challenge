import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { club, challenge } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { createProjectSchema } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = getUser(locals, url.pathname);
	const qClub = await db.query.club.findFirst({
		where: eq(club.id, params.clubId),
		with: {
			challenges: {
				with: {
					members: true
				}
			},
			members: true
		}
	});

	if (!qClub) return error(404);

	const createForm = await superValidate(zod(createProjectSchema));

	return { qClub, createForm, user };
};

export const actions: Actions = {
	default: async ({ locals, request, url, params }) => {
		const user = getUser(locals, url.pathname);

		const form = await superValidate(request, zod(createProjectSchema));

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		if (!user.superUser) return error(401, 'Nicht erlaubt.');

		const { endsAt, name, startsAt } = form.data;

		const [{ id: challengeId }] = await db
			.insert(challenge)
			.values({
				name,
				startsAt: new Date(startsAt),
				endsAt: new Date(endsAt),
				creatorId: user.id,
				clubId: params.clubId
			})
			.returning({ id: challenge.id });

		redirect(302, `/challenges/${challengeId}`);
	}
};
