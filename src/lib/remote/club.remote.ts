import { command, form, query } from '$app/server';
import { db, checkAdmin } from '$lib/db';
import { challenge, club, inviteCode, clubAdmin, clubMember } from '$lib/db/schema';
import { requireUser } from '$lib/remote/auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const clubIdSchema = z.object({ clubId: z.string() });

const createClubSchema = z.object({
	name: z.string().min(5)
});

const joinSchema = z.object({
	code: z.string().min(6)
});

const createChallengeFormSchema = z
	.object({
		clubId: z.string(),
		name: z.string().min(3),
		startsAt: z.string(),
		endsAt: z.string()
	})
	.refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
		message: 'Enddatum muss nach dem Startdatum liegen',
		path: ['endsAt']
	});

const editClubSchema = z.object({
	clubId: z.string(),
	name: z.string().min(5)
});

export const ensureClubsAccess = query(async () => {
	const user = requireUser();
	if (!user.completedProfile) redirect(302, '/profile/edit');
	return { user };
});

export const getClubsPageData = query(async () => {
	const user = requireUser();

	const usersClubs = await db.query.clubMember.findMany({
		where: { userId: user.id },
		with: {
			club: {
				with: {
					challenges: true,
					members: true
				}
			}
		}
	});

	return { usersClubs, user };
});

export const getClubPageData = query(clubIdSchema, async ({ clubId }) => {
	const user = requireUser();

	const qClub = await db.query.club.findFirst({
		where: { id: clubId },
		with: {
			challenges: {
				with: {
					members: true
				}
			},
			members: true
		}
	});

	if (!qClub) error(404, 'Dieser Club existiert nicht');

	if (
		!(await db.query.clubMember.findFirst({
			where: { clubId: qClub.id, userId: user.id }
		}))
	) {
		redirect(302, '/clubs');
	}

	const clubAdmin = await checkAdmin(clubId, user.id);

	return { qClub, user, clubAdmin };
});

export const createClubAccess = query(async () => {
	const user = requireUser();
	if (!user.superUser) redirect(302, '/clubs');
	return { user };
});

export const createClub = form(createClubSchema, async ({ name }) => {
	const user = requireUser();
	if (!user.superUser) redirect(302, '/clubs');

	const [createdClub] = await db
		.insert(club)
		.values({
			name
		})
		.returning();

	await db.insert(clubAdmin).values({
		clubId: createdClub.id,
		userId: user.id
	});

	await db.insert(clubMember).values({
		clubId: createdClub.id,
		userId: user.id
	});

	redirect(302, `/clubs/${createdClub.id}`);
});

export const joinClubAccess = query(async () => {
	const user = requireUser();
	return { user };
});

export const submitJoinCode = form(joinSchema, async ({ code }) => {
	redirect(302, `/clubs/join/${code}`);
});

export const joinClubByCode = query(z.object({ code: z.string() }), async ({ code }) => {
	const user = requireUser();

	const qClub = await db.query.inviteCode.findFirst({ where: { code } });
	if (!qClub) error(404, 'Einladungscode ungültig');

	const alreadyJoined = await db.query.clubMember.findFirst({
		where: { AND: [{ clubId: qClub.clubId }, { userId: user.id }] }
	});

	if (!alreadyJoined) {
		await db.insert(clubMember).values({
			clubId: qClub.clubId,
			userId: user.id
		});
	}

	redirect(302, `/clubs/${qClub.clubId}`);
});

export const createChallengeInClub = form(createChallengeFormSchema, async ({ clubId, name, startsAt, endsAt }) => {
	const user = requireUser();
	if (!user.superUser) error(401, 'Nicht erlaubt.');

	const [{ id: challengeId }] = await db
		.insert(challenge)
		.values({
			name,
			startsAt: new Date(startsAt),
			endsAt: new Date(endsAt),
			clubId
		})
		.returning({ id: challenge.id });

	redirect(302, `/clubs/${clubId}/challenge/${challengeId}`);
});

export const getInviteCode = command(clubIdSchema, async ({ clubId }) => {
	const user = requireUser();
	if (!(await checkAdmin(clubId, user.id))) error(401, 'Nicht erlaubt.');

	const [{ code }] = await db
		.insert(inviteCode)
		.values({
			clubId
		})
		.returning();

	return { code };
});

export const deleteClub = command(clubIdSchema, async ({ clubId }) => {
	const user = requireUser();

	const qClub = await db.query.club.findFirst({
		where: { id: clubId }
	});

	if (!qClub) error(404, 'Club existiert nicht');

	const isAdmin = await checkAdmin(qClub.id, user.id);
	if (!isAdmin) error(401, 'Nicht erlaubt');

	await db.delete(club).where(eq(club.id, qClub.id));

	redirect(302, '/clubs');
});

export const leaveClub = command(clubIdSchema, async ({ clubId }) => {
	const user = requireUser();

	const qClubMember = await db.query.clubMember.findFirst({
		where: { clubId, userId: user.id }
	});

	if (!qClubMember) error(404, 'Du bist kein Mitglied dieses Clubs');

	await db.delete(clubMember).where(eq(clubMember.id, qClubMember.id));

	redirect(302, '/clubs');
});

export const editClubDetails = form(editClubSchema, async ({ clubId, name }) => {
	const user = requireUser();

	const qClub = await db.query.club.findFirst({
		where: { id: clubId }
	});

	if (!qClub) error(404, 'Club existiert nicht');

	const isAdmin = await checkAdmin(qClub.id, user.id);
	if (!isAdmin) error(401, 'Nicht erlaubt');

	await db
		.update(club)
		.set({
			name
		})
		.where(eq(club.id, qClub.id));
});
