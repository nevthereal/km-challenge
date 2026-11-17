import { command, form, getRequestEvent, query } from '$app/server';
import { canAddEntries, getDaysRemainingForEntry, prettyDate } from '#lib/utils.ts';
import { checkAdmin, db, getLeaderBoard } from '#lib/db/index.ts';
import { challenge, challengeMember, discipline, entry } from '#lib/db/schema.ts';
import { addDisciplines, createChallenge, entrySubmission } from '#lib/zod.ts';
import {
	getCurrentUser,
	requireCompletedProfile,
	requireCommandUser
} from '#lib/server/request-user.ts';
import { and, eq, getColumns, gte, lte } from 'drizzle-orm';
import { error, invalid, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { getClubPage, getClubsPage } from './clubs.remote';

const challengeParamsSchema = z.object({
	clubId: z.string().min(1),
	challengeId: z.string().min(1)
});

const memberParamsSchema = challengeParamsSchema.extend({
	memberId: z.string().min(1)
});

const leaderboardSchema = z.object({
	challengeId: z.string().min(1),
	limit: z.number().int().nonnegative()
});

const deleteDisciplineSchema = z.object({
	clubId: z.string().min(1),
	challengeId: z.string().min(1),
	disciplineId: z.string().min(1)
});

const deleteEntrySchema = z.object({
	challengeId: z.string().min(1),
	entryId: z.string().min(1)
});

async function loadChallengeContext(
	{ clubId, challengeId }: z.infer<typeof challengeParamsSchema>,
	isCommand = false
) {
	const user = isCommand
		? requireCommandUser()
		: requireCompletedProfile(`/clubs/${clubId}/challenge/${challengeId}`);

	const currentChallenge = await db.query.challenge.findFirst({
		where: { id: challengeId, clubId },
		with: {
			members: true,
			entries: {
				with: {
					user: { columns: { id: true, name: true, gender: true, role: true } },
					discipline: true
				}
			},
			disciplines: true
		}
	});

	if (!currentChallenge) {
		error(404, 'Challenge nicht gefunden');
	}

	const currentUserChallenge = await db.query.challengeMember.findFirst({
		where: { challengeId, userId: user.id }
	});

	const currentUserClub = await db.query.clubMember.findFirst({
		where: { clubId: currentChallenge.clubId, userId: user.id }
	});

	if (!currentUserClub) {
		if (isCommand) error(403, 'Du bist kein Mitglied des Clubs');
		redirect(302, '/clubs');
	}

	const clubAdmin = await checkAdmin(clubId, user.id);

	return {
		challenge: currentChallenge,
		user,
		currentUserChallenge,
		clubAdmin,
		challengePath: `/clubs/${clubId}/challenge/${challengeId}`
	};
}

export const getHomeDashboard = query(async () => {
	const user = getCurrentUser();

	if (!user) {
		return {
			user: null,
			activeChallenges: [],
			openForEntriesChallenges: []
		};
	}

	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);

	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);

	const activeChallenges = await db
		.select({
			...getColumns(challenge)
		})
		.from(challengeMember)
		.innerJoin(challenge, eq(challengeMember.challengeId, challenge.id))
		.where(
			and(
				eq(challengeMember.userId, user.id),
				lte(challenge.startsAt, endOfToday),
				gte(challenge.endsAt, startOfToday)
			)
		)
		.groupBy(challenge.id);

	const activeChallengesWithDisciplines = await Promise.all(
		activeChallenges.map(async (currentChallenge) => {
			const disciplines = await db.query.discipline.findMany({
				where: {
					challengeId: currentChallenge.id
				}
			});

			return {
				...currentChallenge,
				disciplines
			};
		})
	);

	const openForEntriesChallenges = await db
		.select({
			...getColumns(challenge)
		})
		.from(challengeMember)
		.innerJoin(challenge, eq(challengeMember.challengeId, challenge.id))
		.where(
			and(
				eq(challengeMember.userId, user.id),
				lte(challenge.endsAt, endOfToday),
				gte(challenge.endsAt, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))
			)
		)
		.groupBy(challenge.id);

	return {
		user,
		activeChallenges: activeChallengesWithDisciplines,
		openForEntriesChallenges: openForEntriesChallenges
			.filter((currentChallenge) => canAddEntries(currentChallenge))
			.map((currentChallenge) => ({
				...currentChallenge,
				daysRemaining: getDaysRemainingForEntry(currentChallenge)
			}))
	};
});

export const getLeaderboard = query.batch(leaderboardSchema, async (inputs) => {
	const user = requireCompletedProfile();
	const limits = new Map<string, number>();

	for (const input of inputs) {
		limits.set(input.challengeId, Math.max(limits.get(input.challengeId) ?? 0, input.limit));
	}

	const leaderboards = new Map<string, Awaited<ReturnType<typeof getLeaderBoard.execute>>>();

	await Promise.all(
		Array.from(limits.entries()).map(async ([challengeId, limit]) => {
			const currentChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
			if (!currentChallenge) error(404, 'Challenge nicht gefunden');
			const membership = await db.query.clubMember.findFirst({
				where: { clubId: currentChallenge.clubId, userId: user.id }
			});
			if (!membership) error(403, 'Du bist kein Mitglied des Clubs');
			const rows = await getLeaderBoard.execute({ challengeId, limit });
			leaderboards.set(challengeId, rows);
		})
	);

	return ({ challengeId, limit }) => (leaderboards.get(challengeId) ?? []).slice(0, limit);
});

export const getChallengePageContext = query(challengeParamsSchema, async (params) => {
	return loadChallengeContext(params);
});

export const getChallengeOverview = query(challengeParamsSchema, async (params) => {
	const { challenge } = await loadChallengeContext(params);

	const lastActivities = await db.query.entry.findMany({
		where: {
			challengeId: challenge.id
		},
		limit: 10,
		orderBy(fields, operators) {
			return operators.desc(fields.createdAt);
		},
		with: {
			user: { columns: { id: true, name: true, gender: true, role: true } },
			discipline: true
		}
	});

	type MemberStats = {
		userId: string;
		name: string;
		totalKm: number;
		activityCount: number;
		activeDays: Set<string>;
	};

	const statsByUser = new Map<string, MemberStats>();

	for (const challengeEntry of challenge.entries ?? []) {
		if (!statsByUser.has(challengeEntry.userId)) {
			statsByUser.set(challengeEntry.userId, {
				userId: challengeEntry.userId,
				name: challengeEntry.user?.name ?? 'Unbekannt',
				totalKm: 0,
				activityCount: 0,
				activeDays: new Set<string>()
			});
		}

		const stats = statsByUser.get(challengeEntry.userId);

		if (!stats) continue;

		stats.totalKm += Number(challengeEntry.amount);
		stats.activityCount += 1;
		stats.activeDays.add(new Date(challengeEntry.date).toISOString().slice(0, 10));
	}

	const rankedMembers = Array.from(statsByUser.values());
	const getPodium = (items: MemberStats[]) => ({
		winner: items[0]?.name ?? 'Offen',
		runnerUp: items[1]?.name ?? 'Offen'
	});

	const consistencyRanking = [...rankedMembers].sort((a, b) => {
		return (
			b.activeDays.size - a.activeDays.size ||
			b.activityCount - a.activityCount ||
			b.totalKm - a.totalKm
		);
	});

	const kmRanking = [...rankedMembers].sort((a, b) => {
		return (
			b.totalKm - a.totalKm ||
			b.activityCount - a.activityCount ||
			b.activeDays.size - a.activeDays.size
		);
	});

	const activityRanking = [...rankedMembers].sort((a, b) => {
		return (
			b.activityCount - a.activityCount ||
			b.activeDays.size - a.activeDays.size ||
			b.totalKm - a.totalKm
		);
	});

	return {
		lastActivities,
		daysRemainingForEntry: canAddEntries(challenge) ? getDaysRemainingForEntry(challenge) : 0,
		awards: [
			{
				title: 'Consistency-King/Queen',
				subtitle: 'An den meisten Tagen aktiv',
				...getPodium(consistencyRanking)
			},
			{
				title: 'KM-Master',
				subtitle: 'Sammelt die meisten Kilometer',
				...getPodium(kmRanking)
			},
			{
				title: 'Aktivitäts-Champion',
				subtitle: 'Meiste Aktivitäten insgesamt',
				...getPodium(activityRanking)
			}
		]
	};
});

export const getChallengeMembers = query(challengeParamsSchema, async (params) => {
	const { challengePath } = await loadChallengeContext(params);

	const members = await db.query.challengeMember.findMany({
		where: { challengeId: params.challengeId },
		with: {
			user: {
				columns: {
					name: true,
					gender: true,
					role: true,
					id: true,
					admin: true
				}
			}
		},
		orderBy(fields, operators) {
			return operators.asc(fields.joinedAt);
		}
	});

	const admins = await db.query.clubAdmin.findMany({
		where: {
			clubId: params.clubId
		}
	});

	return { members, admins, challengePath };
});

export const getChallengeMember = query(memberParamsSchema, async (params) => {
	const { challengePath } = await loadChallengeContext(params);

	const member = await db.query.challengeMember.findFirst({
		where: { AND: [{ userId: params.memberId }, { challengeId: params.challengeId }] },
		with: {
			user: {
				columns: { id: true, name: true, gender: true, role: true },
				with: {
					entries: {
						where: {
							challengeId: params.challengeId
						},
						with: {
							discipline: true
						},
						orderBy: (fields, operators) => operators.desc(fields.date)
					}
				}
			}
		}
	});

	if (!member) {
		error(404, 'Dieses Mitglied existiert nicht');
	}

	return { member, challengePath };
});

export const getUserChallengeActivity = query(challengeParamsSchema, async (params) => {
	const { challenge, user, challengePath } = await loadChallengeContext(params);

	const entries = await db.query.entry.findMany({
		where: {
			userId: user.id,
			challengeId: challenge.id
		},
		with: {
			discipline: true
		},
		orderBy: { date: 'desc' }
	});

	const membership = await db.query.challengeMember.findFirst({
		where: {
			userId: user.id,
			challengeId: challenge.id
		},
		with: {
			user: { columns: { id: true, name: true, gender: true, role: true } }
		}
	});

	if (!membership) {
		error(400, 'Keine Mitgliedschaft gefunden');
	}

	return { entries, membership, challengePath };
});

export const createChallengeForm = form(createChallenge, async ({ name, startsAt, endsAt }) => {
	const user = requireCompletedProfile();
	const clubId = getRequestEvent().params.clubId;

	if (!clubId) {
		error(400, 'Club fehlt');
	}

	if (!user.superUser || !(await checkAdmin(clubId, user.id))) {
		error(401, 'Nicht erlaubt.');
	}

	const [{ id: challengeId }] = await db
		.insert(challenge)
		.values({
			name,
			startsAt: new Date(startsAt),
			endsAt: new Date(endsAt),
			clubId
		})
		.returning({ id: challenge.id });

	redirect(303, `/clubs/${clubId}/challenge/${challengeId}`);
});

export const editChallengeForm = form(createChallenge, async ({ name, startsAt, endsAt }) => {
	const user = requireCompletedProfile();
	const { clubId, challengeId } = getRequestEvent().params;

	if (!clubId || !challengeId) {
		error(400, 'Challenge fehlt');
	}

	const currentChallenge = await db.query.challenge.findFirst({
		where: {
			id: challengeId,
			clubId
		}
	});

	if (!currentChallenge) {
		error(404, 'Challenge existiert nicht');
	}

	if (!(await checkAdmin(currentChallenge.clubId, user.id))) {
		error(401, 'Nicht erlaubt');
	}

	await db
		.update(challenge)
		.set({
			name,
			endsAt: new Date(endsAt),
			startsAt: new Date(startsAt)
		})
		.where(eq(challenge.id, currentChallenge.id));
});

export const createEntryForm = form(
	entrySubmission,
	async ({ challengeId, amount, date, disciplineId }, issue) => {
		const user = requireCompletedProfile();

		const currentDiscipline = await db.query.discipline.findFirst({
			where: {
				id: disciplineId
			}
		});

		if (!currentDiscipline || currentDiscipline.challengeId !== challengeId) {
			invalid(issue.disciplineId('Disziplin wählen'));
		}

		const currentChallenge = await db.query.challenge.findFirst({
			where: {
				id: challengeId
			},
			with: {
				members: {
					columns: {
						id: true
					}
				}
			}
		});

		if (!currentChallenge) {
			error(404, 'Challenge nicht gefunden');
		}

		const membership = await db.query.challengeMember.findFirst({
			where: {
				challengeId,
				userId: user.id
			}
		});

		if (!membership) {
			error(403, 'Du bist kein Mitglied dieser Challenge');
		}

		if (!canAddEntries(currentChallenge)) {
			error(403, 'Diese Challenge akzeptiert keine Einträge mehr');
		}

		const entryDate = new Date(date);
		const challengeStart = new Date(currentChallenge.startsAt);
		challengeStart.setUTCHours(0, 0, 0, 0);
		const challengeEnd = new Date(currentChallenge.endsAt);
		challengeEnd.setUTCHours(23, 59, 59, 999);

		if (entryDate < challengeStart || entryDate > challengeEnd) {
			invalid(
				issue.date(
					`Die Aktivität muss zwischen ${prettyDate(currentChallenge.startsAt)} und ${prettyDate(currentChallenge.endsAt)} stattgefunden haben`
				)
			);
		}

		await db.insert(entry).values({
			amount: amount.toString(),
			challengeId,
			date: new Date(date),
			disciplineId,
			userId: user.id
		});
	}
);

export const addDisciplinesForm = form(addDisciplines, async ({ discipline: disciplines }) => {
	const user = requireCompletedProfile();
	const { clubId, challengeId } = getRequestEvent().params;

	if (!clubId || !challengeId) {
		error(400, 'Challenge fehlt');
	}

	await loadChallengeContext({ clubId, challengeId });

	if (!(await checkAdmin(clubId, user.id))) {
		error(401, 'Nicht erlaubt');
	}

	await db.insert(discipline).values(
		disciplines.map((currentDiscipline) => ({
			factor: currentDiscipline.multiplier.toString(),
			name: currentDiscipline.name,
			challengeId
		}))
	);
});

export const deleteChallengeCommand = command(
	challengeParamsSchema,
	async ({ clubId, challengeId }) => {
		const user = requireCommandUser();

		const currentChallenge = await db.query.challenge.findFirst({
			where: {
				id: challengeId,
				clubId
			}
		});

		if (!currentChallenge) {
			error(404, 'Challenge existiert nicht');
		}

		if (!(await checkAdmin(currentChallenge.clubId, user.id))) {
			error(401, 'Nicht erlaubt');
		}

		await db.delete(challenge).where(eq(challenge.id, currentChallenge.id));

		void getClubsPage().refresh();
		void getClubPage(clubId).refresh();
		void getHomeDashboard().refresh();

		return { clubId };
	}
);

export const leaveChallengeCommand = command(
	challengeParamsSchema,
	async ({ clubId, challengeId }) => {
		const user = requireCommandUser();

		await loadChallengeContext({ clubId, challengeId }, true);

		const membership = await db.query.challengeMember.findFirst({
			where: {
				AND: [{ challengeId }, { userId: user.id }]
			}
		});

		if (!membership) {
			error(404, 'Du bist kein Mitglied dieser Challenge');
		}

		await db.delete(challengeMember).where(eq(challengeMember.id, membership.id));

		void getChallengePageContext({ clubId, challengeId }).refresh();
		void getChallengeMembers({ clubId, challengeId }).refresh();
		void getHomeDashboard().refresh();
		void getClubsPage().refresh();
		void getClubPage(clubId).refresh();
	}
);

export const joinChallengeCommand = command(
	challengeParamsSchema,
	async ({ clubId, challengeId }) => {
		const user = requireCommandUser();

		await loadChallengeContext({ clubId, challengeId }, true);

		const clubRelation = await db.query.clubMember.findFirst({
			where: { AND: [{ userId: user.id }, { clubId }] }
		});

		if (!clubRelation) {
			error(401, 'Du bist kein Mitglied des Clubs');
		}

		const existingMembership = await db.query.challengeMember.findFirst({
			where: { AND: [{ userId: user.id }, { challengeId }] }
		});

		if (!existingMembership) {
			await db.insert(challengeMember).values({
				challengeId,
				userId: user.id
			});
		}

		void getChallengePageContext({ clubId, challengeId }).refresh();
		void getChallengeMembers({ clubId, challengeId }).refresh();
		void getHomeDashboard().refresh();
		void getClubsPage().refresh();
		void getClubPage(clubId).refresh();
	}
);

export const deleteDisciplineCommand = command(
	deleteDisciplineSchema,
	async ({ clubId, challengeId, disciplineId }) => {
		const user = requireCommandUser();

		await loadChallengeContext({ clubId, challengeId }, true);

		if (!(await checkAdmin(clubId, user.id))) {
			error(401, 'Nicht erlaubt');
		}

		const currentDiscipline = await db.query.discipline.findFirst({
			where: {
				AND: [{ id: disciplineId }, { challengeId }]
			}
		});

		if (!currentDiscipline || currentDiscipline.challengeId !== challengeId) {
			error(404, 'Disziplin nicht gefunden');
		}

		await db.delete(discipline).where(eq(discipline.id, currentDiscipline.id));
	}
);

export const deleteEntryCommand = command(deleteEntrySchema, async ({ challengeId, entryId }) => {
	const user = requireCommandUser();
	const currentChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!currentChallenge) error(404, 'Challenge nicht gefunden');

	const currentEntry = await db.query.entry.findFirst({
		where: {
			id: entryId,
			challengeId
		}
	});

	if (!currentEntry) {
		error(404, 'Eintrag nicht gefunden');
	}

	if (currentEntry.userId !== user.id) {
		error(401, 'Nicht erlaubt');
	}

	await db.delete(entry).where(eq(entry.id, currentEntry.id));
});
