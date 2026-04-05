import { command, form, getRequestEvent, query } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import { checkAdmin, db } from '$lib/db';
import { club, clubAdmin, clubMember, inviteCode } from '$lib/db/schema';
import { createClub, editClub, joinClubByCode } from '$lib/zod';
import { requireCompletedProfile } from '$lib/server/request-user';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const clubIdSchema = z.string().min(1);

export const getClubsPage = query(async () => {
	const user = requireCompletedProfile();

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

export const getCreateClubPage = query(async () => {
	const user = requireCompletedProfile();

	if (!user.superUser) {
		redirect(302, '/clubs');
	}

	return { user };
});

export const getClubPage = query(clubIdSchema, async (clubId) => {
	const user = requireCompletedProfile();

	const currentClub = await db.query.club.findFirst({
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

	if (!currentClub) {
		error(404, 'Dieser Club existiert nicht');
	}

	const membership = await db.query.clubMember.findFirst({
		where: { clubId: currentClub.id, userId: user.id }
	});

	if (!membership) {
		redirect(302, '/clubs');
	}

	const clubAdmin = await checkAdmin(currentClub.id, user.id);

	return {
		club: currentClub,
		user,
		clubAdmin
	};
});

export const getJoinClubPage = query(async () => {
	const user = requireCompletedProfile();

	return { user };
});

export const createClubForm = form(createClub, async ({ name }) => {
	const user = requireCompletedProfile();

	if (!user.superUser) {
		redirect(302, '/clubs');
	}

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

	redirect(303, `/clubs/${createdClub.id}`);
});

export const joinClubByCodeForm = form(joinClubByCode, async ({ code }) => {
	redirect(303, `/clubs/join/${code}`);
});

export const editClubForm = form(editClub, async ({ name }) => {
	const user = requireCompletedProfile();
	const clubId = getRequestEvent().params.clubId;

	if (!clubId) {
		error(400, 'Club fehlt');
	}

	const currentClub = await db.query.club.findFirst({
		where: { id: clubId }
	});

	if (!currentClub) {
		error(404, 'Club existiert nicht');
	}

	const isAdmin = await checkAdmin(currentClub.id, user.id);

	if (!isAdmin) {
		error(401, 'Nicht erlaubt');
	}

	await db
		.update(club)
		.set({
			name
		})
		.where(eq(club.id, currentClub.id));

	void getClubPage(clubId).refresh();
});

export const generateInviteCode = command(clubIdSchema, async (clubId) => {
	const user = requireCompletedProfile();

	if (!(await checkAdmin(clubId, user.id))) {
		error(401, 'Nicht erlaubt.');
	}

	const [createdInvite] = await db
		.insert(inviteCode)
		.values({
			clubId
		})
		.returning();

	return { code: createdInvite.code };
});

export const deleteClubCommand = command(clubIdSchema, async (clubId) => {
	const user = requireCompletedProfile();

	const currentClub = await db.query.club.findFirst({
		where: { id: clubId }
	});

	if (!currentClub) {
		error(404, 'Club existiert nicht');
	}

	if (!(await checkAdmin(currentClub.id, user.id))) {
		error(401, 'Nicht erlaubt');
	}

	await db.delete(club).where(eq(club.id, currentClub.id));

	return { redirect: '/clubs' };
});

export const leaveClubCommand = command(clubIdSchema, async (clubId) => {
	const user = requireCompletedProfile();

	const membership = await db.query.clubMember.findFirst({
		where: { clubId, userId: user.id }
	});

	if (!membership) {
		error(404, 'Du bist kein Mitglied dieses Clubs');
	}

	await db.delete(clubMember).where(eq(clubMember.id, membership.id));

	return { redirect: '/clubs' };
});
