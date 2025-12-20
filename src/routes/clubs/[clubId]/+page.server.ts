import { db, checkAdmin } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { club, challenge, inviteCode, clubMember } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { createChallenge, editClub } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });
	const qClub = await db.query.club.findFirst({
		where: { id: params.clubId },
		with: {
			challenges: {
				with: {
					members: true
				}
			},
			members: true
		}
	});

	if (!qClub) return error(404, 'Dieser Club existiert nicht');

	if (
		!(await db.query.clubMember.findFirst({
			where: { clubId: qClub.id, userId: user.id }
		}))
	)
		return redirect(302, '/clubs');

	const createForm = await superValidate(zod4(createChallenge));

	const editClubForm = await superValidate(zod4(editClub), {
		defaults: {
			name: qClub.name
		}
	});

	const clubAdmin = await checkAdmin(params.clubId, user.id);

	return { qClub, createForm, user, clubAdmin, editClubForm };
};

export const actions: Actions = {
	createChallenge: async ({ locals, request, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const form = await superValidate(request, zod4(createChallenge));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!user.superUser) return error(401, 'Nicht erlaubt.');

		const { endsAt, name, startsAt } = form.data as {
			name: string;
			startsAt: Date | string;
			endsAt: Date | string;
		};

		const [{ id: challengeId }] = await db
			.insert(challenge)
			.values({
				name,
				startsAt: new Date(startsAt),
				endsAt: new Date(endsAt),
				clubId: params.clubId
			})
			.returning({ id: challenge.id });

		redirect(302, `/clubs/${params.clubId}/challenge/${challengeId}`);
	},
	getCode: async ({ locals, params, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });
		if (!(await checkAdmin(params.clubId, user.id))) return error(401, 'Nicht erlaubt.');

		const [{ code }] = await db
			.insert(inviteCode)
			.values({
				clubId: params.clubId
			})
			.returning();

		return { code };
	},
	deleteClub: async ({ locals, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		// query club from db
		const qClub = await db.query.club.findFirst({
			where: { id: params.clubId }
		});

		// error if no club
		if (!qClub) return error(404, 'Club existiert nicht');

		// check if user is admin of club
		const isAdmin = await checkAdmin(qClub.id, user.id);

		// error if not admin
		if (!isAdmin) return error(401, 'Nicht erlaubt');

		// actually delete
		await db.delete(club).where(eq(club.id, qClub.id));

		return redirect(302, '/clubs');
	},
	leave: async ({ locals, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const qClubMember = await db.query.clubMember.findFirst({
			where: { clubId: params.clubId, userId: user.id }
		});

		if (!qClubMember) return error(404, 'Du bist kein Mitglied dieses Clubs');

		await db.delete(clubMember).where(eq(clubMember.id, qClubMember.id));

		return redirect(302, '/clubs');
	},
	edit: async ({ locals, url, params, request }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const form = await superValidate(request, zod4(editClub));

		if (!form.valid) return fail(400, { form });

		// query club from db
		const qClub = await db.query.club.findFirst({
			where: { id: params.clubId }
		});

		// error if no club
		if (!qClub) return error(404, 'Club existiert nicht');

		// check if user is admin of club
		const isAdmin = await checkAdmin(qClub.id, user.id);

		// error if not admin
		if (!isAdmin) return error(401, 'Nicht erlaubt');

		// actually delete
		await db
			.update(club)
			.set({
				name: form.data.name
			})
			.where(eq(club.id, qClub.id));

		return { form };
	}
};
