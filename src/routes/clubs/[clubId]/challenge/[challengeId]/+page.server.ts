import { getUser, isChallengeActive, prettyDate } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createChallenge, newEntry } from '$lib/zod';
import { checkAdmin, db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember, clubMember, discipline, entry } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { challenge } = await parent();

	const leaderboard = getLeaderBoard.execute({
		challengeId: challenge.id,
		limit: challenge.members.length
	});

	const newEntryForm = await superValidate(zod4(newEntry));

	const lastActivities = await db.query.entry.findMany({
		where: {
			challengeId: challenge.id
		},
		limit: 10,
		orderBy(fields, operators) {
			return operators.desc(fields.createdAt);
		},
		with: {
			user: true,
			discipline: true
		}
	});

	return { leaderboard, newEntryForm, lastActivities };
};

export const actions: Actions = {
	newEntry: async ({ request, params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });
		const form = await superValidate(request, zod4(newEntry));

		if (!form.valid) return fail(400, { form });

		const qDiscipline = await db.query.discipline.findFirst({
			where: {
				id: form.data.disciplineId
			}
		});

		if (!qDiscipline) return error(404, 'Disziplin nicht gefunden');

		const qChallenge = await db.query.challenge.findFirst({
			where: {
				id: qDiscipline.challengeId
			}
		});

		if (!qChallenge) return error(404, 'Challenge nicht gefunden');

		if (!isChallengeActive(qChallenge)) return error(403, 'Challenge ist nicht aktiv');

		// Validate entry date is within challenge range (entries can only be backdated within the challenge period)
		const entryDate = new Date(form.data.date);
		const challengeStart = new Date(qChallenge.startsAt);
		challengeStart.setUTCHours(0, 0, 0, 0);
		const challengeEnd = new Date(qChallenge.endsAt);
		// Add 2-day grace period for entries
		challengeEnd.setUTCDate(challengeEnd.getUTCDate() + 2);
		challengeEnd.setUTCHours(23, 59, 59, 999);

		if (entryDate < challengeStart || entryDate > challengeEnd) {
			return error(
				400,
				`Einträge können nur zwischen ${prettyDate(qChallenge.startsAt)} und ${prettyDate(new Date(qChallenge.endsAt.getTime() + 2 * 24 * 60 * 60 * 1000))} erstellt werden`
			);
		}

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
			where: {
				id: params.challengeId
			}
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
	editChallenge: async ({ locals, url, params, request }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		// query challenge from db
		const qChallenge = await db.query.challenge.findFirst({
			where: {
				id: params.challengeId
			}
		});

		// error if no challenge
		if (!qChallenge) return error(404, 'Challenge existiert nicht');

		// check if user is admin of challenge
		const isAdmin = checkAdmin(qChallenge.clubId, user.id);

		// error if not admin
		if (!isAdmin) return error(401, 'Nicht erlaubt');

		const form = await superValidate(request, zod4(createChallenge));

		if (!form.valid) return fail(400, { form });

		const { name, endsAt, startsAt } = form.data;

		await db
			.update(challenge)
			.set({
				name,
				endsAt,
				startsAt
			})
			.where(eq(challenge.id, qChallenge.id));

		return { form };
	},
	leave: async ({ locals, url, params }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const qChallengeMember = await db.query.challengeMember.findFirst({
			where: {
				AND: [{ challengeId: params.challengeId }, { userId: user.id }]
			}
		});

		if (!qChallengeMember) return error(404, 'Du bist kein Mitglied dieser Challenge');

		await db.delete(challengeMember).where(eq(challengeMember.id, qChallengeMember.id));
	},
	join: async ({ params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

		const clubRel = await db.query.clubMember.findFirst({
			where: { AND: [{ userId: user.id }, { clubId: params.clubId }] }
		});

		if (!clubRel) return error(401, 'Du bist kein Mitglied des Clubs');

		await db.insert(challengeMember).values({
			challengeId: params.challengeId,
			userId: user.id
		});
	}
};
