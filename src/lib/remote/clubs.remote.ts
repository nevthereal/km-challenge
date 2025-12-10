import { command, form, query } from '$app/server';
import * as schema from '$lib/db/schema';
import { db } from '$lib/db';
import { inviteCode } from '$lib/db/schema';
import { getUser } from '$lib/remote/auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { getTableColumns, eq, and, lte, gte } from 'drizzle-orm';
import { z } from 'zod';
import { editClub } from '$lib/zod';
import { getLeaderBoard } from './challenge.remote';

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

export const createClub = form(z.object({ name: z.string() }), async (data) => {
	const user = await getUser();

	if (!user.superUser) return redirect(302, '/clubs');

	const createdClubId = await db.transaction(async (tx) => {
		const [createdClub] = await tx
			.insert(schema.club)
			.values({
				name: data.name
			})
			.returning();

		await tx.insert(schema.clubAdmin).values({
			clubId: createdClub.id,
			userId: user.id
		});

		await tx.insert(schema.clubMember).values({
			clubId: createdClub.id,
			userId: user.id
		});

		return createdClub.id;
	});

	return redirect(302, `/clubs/${createdClubId}`);
});

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

export const deleteClub = command(z.string(), async (clubId) => {
	await getUser();

	// query club from db
	const qClub = await db.query.club.findFirst({
		where: {
			id: clubId
		}
	});

	// error if no club
	if (!qClub) return error(404, 'Club existiert nicht');

	// check if user is admin of club
	const isAdmin = checkAdmin(qClub.id);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db.delete(schema.club).where(eq(schema.club.id, qClub.id));

	return redirect(302, '/clubs'); // TODO remove redirect here
});

export const leaveClub = command(z.string(), async (clubId) => {
	const user = await getUser();

	// and(eq(clubMember.clubId, params.clubId), eq(clubMember.userId, user.id))

	const qClubMember = await db.query.clubMember.findFirst({
		where: {
			clubId,
			userId: user.id
		}
	});

	if (!qClubMember) return error(404, 'Du bist kein Mitglied dieses Clubs');

	await db.delete(schema.clubMember).where(eq(schema.clubMember.id, qClubMember.id));

	return redirect(302, '/clubs');
});

export const renameClub = form(editClub, async (data) => {
	await getUser();

	// query club from db
	const qClub = await db.query.club.findFirst({
		where: {
			id: data.clubId
		}
	});

	// error if no club
	if (!qClub) return error(404, 'Club existiert nicht');

	// check if user is admin of club
	const isAdmin = checkAdmin(qClub.id);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db
		.update(schema.club)
		.set({
			name: data.name
		})
		.where(eq(schema.club.id, qClub.id));

	return { form };
});

export const joinWithCode = form(z.object({ code: z.string() }), async (data) => {
	const { code } = data;

	return redirect(302, `/clubs/join/${code}`);
});
