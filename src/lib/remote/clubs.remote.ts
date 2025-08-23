import { command, form, query } from '$app/server';
import { validator } from 'svelte-checkmate';
import * as schema from '$lib/db/schema';
import { db } from '$lib/db';
import { inviteCode } from '$lib/db/schema';
import { getUser } from '$lib/remote/auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { getTableColumns, sql, eq, desc, asc, and, lte, gte } from 'drizzle-orm';
import { z } from 'zod';
import { editClub, newEntry } from '$lib/zod';
import { isActive } from '$lib/utils';

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

export const createClub = form(async (formData) => {
	const user = await getUser();

	if (!user.superUser) return redirect(302, '/clubs');

	const form = await validator({ schema: z.object({ name: z.string() }), formData });

	if (!form.success) return error(400);

	const [createdClub] = await db
		.insert(schema.club)
		.values({
			name: form.data.name
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
	const user = await getUser();

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

export const renameClub = form(async (formData) => {
	const user = await getUser();

	const form = await validator({ schema: editClub, formData });

	if (!form.success) return error(400);

	const { data } = form;

	// query club from db
	const qClub = await db.query.club.findFirst({
		where: {
			id: data.clubId
		}
	});

	// error if no club
	if (!qClub) return error(404, 'Club existiert nicht');

	// check if user is admin of club
	const isAdmin = checkAdmin(qClub.id, user.id);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db
		.update(schema.club)
		.set({
			name: form.data.name
		})
		.where(eq(schema.club.id, qClub.id));

	return { form };
});
