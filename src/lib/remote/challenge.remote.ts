import { command, form, getRequestEvent, query } from '$app/server';
import * as schema from '$lib/db/schema';
import { db } from '$lib/db';
import { getTableColumns, sql, eq, asc, desc, and } from 'drizzle-orm';
import z from 'zod';
import { getUser } from './auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { validator } from 'svelte-checkmate';
import { newChallenge, newEntry } from '$lib/zod';
import { isActive } from '$lib/utils';
import { checkAdmin } from './clubs.remote';

export const getLeaderBoard = query(
	z.object({ challengeId: z.string(), limit: z.number().nullable() }),
	async ({ challengeId, limit }) => {
		const lb = db
			.select({
				...getTableColumns(schema.user),
				score:
					sql<number>`round(sum(COALESCE(${schema.entry.amount}, 0) * COALESCE(${schema.discipline.factor}, 1)), 2)`.as(
						'score'
					),
				totalEntries: sql<number>`count(${schema.entry.id})`.as('total_entries'),
				lastActivity: sql<string>`max(${schema.entry.date})`.as('last_activity')
			})
			.from(schema.entry)
			.leftJoin(schema.discipline, eq(schema.entry.disciplineId, schema.discipline.id))
			.innerJoin(schema.user, eq(schema.entry.userId, schema.user.id))
			.where(eq(schema.entry.challengeId, challengeId))
			.groupBy(schema.user.id)
			.orderBy(desc(sql`score`), asc(schema.user.id));

		if (limit) return await lb.limit(Math.max(0, limit));

		return await lb;
	}
);

export const createEntry = form(newEntry, async (data) => {
	const user = await getUser();

	const qDiscipline = await db.query.discipline.findFirst({
		where: {
			id: data.disciplineId
		}
	});

	if (!qDiscipline) return error(404, 'Disziplin nicht gefunden');

	const qChallenge = await db.query.challenge.findFirst({
		where: {
			id: qDiscipline.challengeId
		}
	});

	if (!qChallenge) return error(404, 'Challenge nicht gefunden');

	if (!isActive({ start: qChallenge.startsAt, finish: qChallenge.endsAt }))
		return error(403, 'Challenge ist nicht aktiv');

	if (!qDiscipline) return error(400);

	await db.insert(schema.entry).values({
		amount: data.amount.toString(),
		challengeId: qChallenge.id,
		date: new Date(data.date),
		disciplineId: data.disciplineId,
		userId: user.id
	});
});

export const createChallenge = form(newChallenge, async (data) => {
	const user = await getUser();

	if (!user.superUser) return error(401, 'Nicht erlaubt.');

	const { endsAt, name, startsAt, clubId } = data;

	const [{ id: challengeId }] = await db
		.insert(schema.challenge)
		.values({
			name,
			startsAt: new Date(startsAt),
			endsAt: new Date(endsAt),
			clubId
		})
		.returning({ id: schema.challenge.id });

	redirect(302, `/clubs/${clubId}/challenge/${challengeId}`);
});

export const deleteChallenge = command(z.string(), async (challengeId) => {
	await getUser();

	// query challenge from db
	const qChallenge = await db.query.challenge.findFirst({
		where: {
			id: challengeId
		}
	});

	// error if no challenge
	if (!qChallenge) return error(404, 'Challenge existiert nicht');

	// check if user is admin of challenge
	const isAdmin = checkAdmin(qChallenge.clubId);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db.delete(schema.challenge).where(eq(schema.challenge.id, qChallenge.id));

	return redirect(302, `/clubs/${qChallenge.clubId}`); // edit redirect here TODO
});

export const editChallenge = form(newChallenge, async (data) => {
	await getUser();

	// query challenge from db
	const qChallenge = await db.query.challenge.findFirst({
		where: {
			id: data.clubId
		}
	});

	// error if no challenge
	if (!qChallenge) return error(404, 'Challenge existiert nicht');

	// check if user is admin of challenge
	const isAdmin = checkAdmin(qChallenge.clubId);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	const { name, endsAt, startsAt } = data;

	await db
		.update(schema.challenge)
		.set({
			name,
			endsAt: new Date(endsAt),
			startsAt: new Date(startsAt)
		})
		.where(eq(schema.challenge.id, qChallenge.id));

	return { form };
});

export const leaveChallenge = command(z.string(), async (challengeId) => {
	const user = await getUser();
	try {
		await db
			.delete(schema.challengeMember)
			.where(
				and(eq(schema.challengeMember.id, challengeId), eq(schema.challengeMember.userId, user.id))
			);
	} catch (e) {
		console.error(e);
		return error(404, 'Du bist kein Mitglied dieser Challenge');
	}
});

export const joinChallenge = command(
	z.object({ clubId: z.string(), challengeId: z.string() }),
	async (ids) => {
		const user = await getUser();

		await db.transaction(async (tx) => {
			const clubRel = await tx.query.clubMember.findFirst({
				where: {
					userId: user.id,
					clubId: ids.clubId
				}
			});

			if (!clubRel) return error(401, 'Du bist kein Mitglied des Clubs');

			// Try upsert to avoid duplicates. Requires a unique constraint on (user_id, challenge_id).
			try {
				await tx
					.insert(schema.challengeMember)
					.values({
						challengeId: ids.challengeId,
						userId: user.id
					})
					.onConflictDoNothing({
						target: [schema.challengeMember.userId, schema.challengeMember.challengeId]
					});
			} catch (e) {
				console.warn('joinChallenge upsert failed; falling back to check-then-insert', e);
				// Fallback if constraint is missing: check-then-insert.
				const existing = await tx.query.challengeMember.findFirst({
					where: {
						userId: user.id,
						challengeId: ids.challengeId
					}
				});
				if (!existing) {
					await tx.insert(schema.challengeMember).values({
						challengeId: ids.challengeId,
						userId: user.id
					});
				}
			}
		});
	}
);
