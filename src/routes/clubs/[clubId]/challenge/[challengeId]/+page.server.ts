import { getUser, isActive } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';
import { checkAdmin, db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember, discipline, entry } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { challenge } = await parent();

	const leaderboard = getLeaderBoard(challenge.id);
	const newEntryForm = await superValidate(zod(newEntry));

	return { leaderboard, newEntryForm };
};

export const actions: Actions = {
	newEntry: async ({ request, params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });
		const form = await superValidate(request, zod(newEntry));

		if (!form.valid) return fail(400, { form });

		const qDiscipline = await db.query.discipline.findFirst({
			where: eq(discipline.id, form.data.disciplineId)
		});

		if (!qDiscipline) return error(404, 'Disziplin nicht gefunden');

		const qChallenge = await db.query.challenge.findFirst({
			where: eq(challenge.id, qDiscipline?.challengeId)
		});

		if (!qChallenge) return error(404, 'Challenge nicht gefunden');

		if (!isActive({ start: qChallenge.startsAt, finish: qChallenge.endsAt }))
			return error(403, 'Challenge ist nicht aktiv');

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
	},
	leave: async ({ locals, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const qChallengeMember = await db.query.challengeMember.findFirst({
			where: and(
				eq(challengeMember.challengeId, params.challengeId),
				eq(challengeMember.userId, user.id)
			)
		});

		if (!qChallengeMember) return error(404, 'Du bist kein Mitglied dieser Challenge');

		await db.delete(challengeMember).where(eq(challengeMember.id, qChallengeMember.id));

		return redirect(302, `/clubs/${params.clubId}`);
	}
};
