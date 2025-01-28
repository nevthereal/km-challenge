import { db } from '$lib/db';
import { and, eq, sql, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { challenge, challengeMember, discipline, entry, user } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { addDisciplines, newEntry } from '$lib/zod';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const currentUser = getUser(locals, url.pathname);
	const { challengeId } = params;

	if (!currentUser.completedProfile) return redirect(302, '/profile/edit');

	const qchallenge = await db.query.challenge.findFirst({
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

	const currentUserChallenge = await db.query.challengeMember.findFirst({
		where: and(
			eq(challengeMember.challengeId, challengeId),
			eq(challengeMember.userId, currentUser.id)
		)
	});

	if (!qchallenge) return redirect(302, '/challenges');

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

	const leaderboard = await db
		.select({
			username: user.name,
			score: sql<number>`round(sum(${entry.amount} * ${discipline.factor}), 2)`.as('score'),
			totalEntries: sql<number>`count(${entry.id})`.as('total_entries'),
			lastActivity: sql<Date>`max(${entry.date})`.as('last_activity'),
			role: user.role,
			gender: user.gender
		})
		.from(entry)
		.innerJoin(discipline, eq(entry.disciplineId, discipline.id))
		.innerJoin(user, eq(entry.userId, user.id))
		.where(eq(entry.challengeId, challengeId))
		.groupBy(user.id)
		.orderBy(desc(sql`score`));

	return {
		challenge: qchallenge,
		user: currentUser,
		addDisciplineForm,
		newEntryForm,
		currentUserChallenge,
		leaderboard
	};
};

export const actions: Actions = {
	addDiscipline: async ({ request, params, locals, url }) => {
		const user = getUser(locals, url.pathname);

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
		const user = getUser(locals, url.pathname);
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
	join: async ({ locals, params, url }) => {
		const user = getUser(locals, url.pathname);

		await db.insert(challengeMember).values({
			challengeId: params.challengeId,
			userId: user.id
		});
	}
};
