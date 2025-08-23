import { command, form, query } from '$app/server';
import { validator } from 'svelte-checkmate';
import * as schema from '$lib/db/schema';
import { db } from '$lib/db';
import { inviteCode } from '$lib/db/schema';
import { getUser } from '$lib/remote/auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { getTableColumns, sql, eq, desc, asc, and, lte, gte } from 'drizzle-orm';
import { z } from 'zod';

export const checkAdmin = query(z.string(), async (clubId) => {
	const user = await getUser();

	const query = await db.query.clubAdmin.findFirst({
		where: {
			userId: user.id,
			clubId
		}
	});

	if (query) return true;

	return false;
});

export const getUsersClubs = query(async () => {
	const user = await getUser();

	const usersClubs = await db.query.user.findMany({
		where: {
			id: user.id
		},
		with: {
			clubs: {
				with: {
					members: true,
					challenges: true
				}
			}
		}
	});

	return usersClubs[0].clubs;
});

export const getClub = query(z.string(), async (clubId) => {
	const user = await getUser();

	const qClub = await db.query.club.findFirst({
		where: {
			id: clubId
		},
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

	if (
		!(await db.query.clubMember.findFirst({
			where: {
				AND: [
					{
						clubId: qClub.id
					},
					{
						userId: user.id
					}
				]
			}
		}))
	)
		return redirect(302, '/clubs');
	return qClub;
});

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

export const getActiveChallengeWithLeaderBoard = query(async () => {
	const user = await getUser();

	const activeChallenges = await db
		.select({
			...getTableColumns(schema.challenge)
		})
		.from(schema.challengeMember)
		.innerJoin(schema.challenge, eq(schema.challengeMember.challengeId, schema.challenge.id))
		.where(
			and(
				eq(schema.challengeMember.userId, user.id),
				lte(schema.challenge.startsAt, new Date()),
				gte(schema.challenge.endsAt, new Date())
			)
		)
		.groupBy(schema.challenge.id);

	const challengesWithLeaderboards = activeChallenges.map(async (c) => {
		const disciplines = await db.query.discipline.findMany({
			where: {
				challengeId: c.id
			}
		});
		const leaderboard = getLeaderBoard({ challengeId: c.id, limit: 5 });
		return { ...c, leaderboard, disciplines };
	});

	return await Promise.all(challengesWithLeaderboards);
});

// export type LeaderBoard = Awaited<ReturnType<typeof getLeaderBoard>>

export const createInviteCode = command(z.string(), async (clubId) => {
	if (!checkAdmin(clubId)) return error(401, 'Nicht erlaubt.');

	const [{ code }] = await db
		.insert(inviteCode)
		.values({
			clubId
		})
		.returning();

	return { code };
});

export const createClub = form(async (formData) => {
	const user = await getUser();

	if (!user.superUser) return redirect(302, '/clubs');

	const validation = await validator({ schema: z.object({ name: z.string() }), formData });

	if (!validation.success) return error(400);

	const [createdClub] = await db
		.insert(schema.club)
		.values({
			name: validation.data.name
		})
		.returning();

	await db.insert(schema.clubAdmin).values({
		clubId: createdClub.id,
		userId: user.id
	});

	await db.insert(schema.clubMember).values({
		clubId: createdClub.id,
		userId: user.id
	});

	return redirect(302, `/clubs/${createdClub.id}`);
});
