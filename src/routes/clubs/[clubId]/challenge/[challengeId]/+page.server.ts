import { checkAdmin, db, getLeaderBoard } from '$lib/db';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { challenge, challengeMember, clubMember, discipline, entry } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { addDisciplines, newEntry } from '$lib/zod';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });
	const { challengeId } = params;

	if (!user.completedProfile) return redirect(302, '/profile/edit');

	const qChallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, challengeId),
		with: {
			members: true,
			entries: {
				with: {
					user: true,
					discipline: true
				}
			},
			disciplines: true
		}
	});

	if (!qChallenge) return error(404, 'Challenge nicht gefunden');

	const currentUserChallenge = await db.query.challengeMember.findFirst({
		where: and(eq(challengeMember.challengeId, challengeId), eq(challengeMember.userId, user.id))
	});

	const currentUserClub = await db.query.clubMember.findFirst({
		where: and(eq(clubMember.clubId, qChallenge.clubId), eq(clubMember.userId, user.id))
	});

	if (!currentUserClub) return redirect(302, '/clubs');

	const addDisciplineForm = await superValidate(zod(addDisciplines), {
		defaults: {
			discipline: [
				{
					name: '',
					multiplier: 1
				}
			]
		}
	});

	const newEntryForm = await superValidate(zod(newEntry));

	const leaderboard = getLeaderBoard(challengeId);

	const clubAdmin = await checkAdmin(params.clubId, user.id);

	return {
		challenge: qChallenge,
		user: user,
		addDisciplineForm,
		newEntryForm,
		currentUserChallenge,
		leaderboard,
		clubAdmin
	};
};

export const actions: Actions = {
	addDiscipline: async ({ request, params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		if (!user.superUser) return error(401);

		const form = await superValidate(request, zod(addDisciplines));

		if (!form.valid) return fail(400, { form });

		for (const d of form.data.discipline) {
			await db.insert(discipline).values({
				factor: d.multiplier.toString(),
				name: d.name,
				challengeId: params.challengeId
			});
		}
	},
	newEntry: async ({ request, params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });
		const form = await superValidate(request, zod(newEntry));

		if (!form.valid) return fail(400, { form });

		const qDiscipline = await db.query.discipline.findFirst({
			where: eq(discipline.id, form.data.disciplineId)
		});

		if (!qDiscipline) return setError(form, 'disciplineId', 'Disziplin wählen');

		await db.insert(entry).values({
			amount: form.data.amount.toString(),
			challengeId: params.challengeId,
			date: new Date(form.data.date),
			disciplineId: form.data.disciplineId,
			userId: user.id
		});
	},
	deleteChallenge: async ({ locals, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		// query challenge from db
		const qChallenge = await db.query.challenge.findFirst({
			where: ({ id }, { eq }) => eq(id, params.challengeId)
		});

		// error if no challenge
		if (!qChallenge) return error(404, 'Challenge existiert nicht');

		// check if user is admin of challenge
		const isAdmin = checkAdmin(qChallenge.clubId, user.id);

		// error if not admin
		if (!isAdmin) return error(401, 'Nicht erlaubt');

		// actually delete
		await db.delete(challenge).where(eq(challenge.id, qChallenge.id));

		return redirect(302, `/clubs/${qChallenge.clubId}`);
	}
};
