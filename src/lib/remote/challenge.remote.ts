import { command, form, getRequestEvent, query } from '$app/server';
import { checkAdmin, db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember, discipline, entry, clubAdmin as clubAdminTable } from '$lib/db/schema';
import { requireUser } from '$lib/server/auth-helpers';
import { canAddEntries, getDaysRemainingForEntry, prettyDate } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import { eq, and, getColumns, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

const challengeInput = z.object({ challengeId: z.string() });
const clubChallengeInput = z.object({ clubId: z.string(), challengeId: z.string() });

const addEntrySchema = z.object({
	challengeId: z.string(),
	disciplineId: z.string(),
	amount: z.number().min(0.01),
	date: z.string()
});

const editChallengeSchema = z
	.object({
		clubId: z.string(),
		challengeId: z.string(),
		name: z.string().min(3),
		startsAt: z.string(),
		endsAt: z.string()
	})
	.refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
		message: 'Enddatum muss nach dem Startdatum liegen',
		path: ['endsAt']
	});

const addDisciplinesSchema = z.object({
	challengeId: z.string(),
	discipline: z
		.object({
			name: z.string().min(1),
			multiplier: z.number().min(0.1)
		})
		.array()
});

const deleteDisciplineSchema = z.object({
	challengeId: z.string(),
	disciplineId: z.string()
});

const deleteEntrySchema = z.object({
	challengeId: z.string(),
	entryId: z.string()
});

const challengeRouteSchema = z.object({
	clubId: z.string(),
	challengeId: z.string()
});

const challengeMemberRouteSchema = z.object({
	clubId: z.string(),
	challengeId: z.string(),
	memberId: z.string()
});

async function getChallengeContext(clubId: string, challengeId: string) {
	const user = requireUser();

	if (!user.completedProfile) redirect(302, '/profile/edit');

	const qChallenge = await db.query.challenge.findFirst({
		where: { id: challengeId },
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

	if (!qChallenge) error(404, 'Challenge nicht gefunden');

	const currentUserChallenge = await db.query.challengeMember.findFirst({
		where: { challengeId, userId: user.id }
	});

	const currentUserClub = await db.query.clubMember.findFirst({
		where: { clubId: qChallenge.clubId, userId: user.id }
	});

	if (!currentUserClub) redirect(302, '/clubs');

	const clubAdmin = await checkAdmin(clubId, user.id);
	const challengePath = `/clubs/${clubId}/challenge/${challengeId}`;

	return {
		challenge: qChallenge,
		user,
		currentUserChallenge,
		clubAdmin,
		challengePath
	};
}

export const getHomePageData = query(async () => {
	const { locals } = getRequestEvent();
	const user = locals.user;

	if (!user) {
		return {
			user: null,
			challengesWithLeaderboards: [],
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

	const challengesWithLeaderboards = await Promise.all(
		activeChallenges.map(async (c) => {
			const disciplines = await db.query.discipline.findMany({ where: { challengeId: c.id } });
			const leaderboard = await getLeaderBoard.execute({ challengeId: c.id, limit: 5 });
			return { ...c, leaderboard, disciplines };
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

	const openForEntriesChallengesWithDays = openForEntriesChallenges
		.filter((c) => canAddEntries(c))
		.map((c) => ({
			...c,
			daysRemaining: getDaysRemainingForEntry(c)
		}));

	return {
		challengesWithLeaderboards,
		user,
		openForEntriesChallenges: openForEntriesChallengesWithDays
	};
});

export const getChallengeLayoutData = query(challengeRouteSchema, async ({ clubId, challengeId }) => {
	return getChallengeContext(clubId, challengeId);
});

export const getChallengeOverviewData = query(challengeRouteSchema, async ({ clubId, challengeId }) => {
	const context = await getChallengeContext(clubId, challengeId);
	const { challenge } = context;

	const leaderboard = await getLeaderBoard.execute({
		challengeId: challenge.id,
		limit: challenge.members.length
	});

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

	type MemberStats = {
		userId: string;
		name: string;
		totalKm: number;
		activityCount: number;
		activeDays: Set<string>;
	};

	const statsByUser = new Map<string, MemberStats>();
	for (const challengeEntry of challenge.entries ?? []) {
		const userId = challengeEntry.userId;
		if (!statsByUser.has(userId)) {
			statsByUser.set(userId, {
				userId,
				name: challengeEntry.user?.name ?? 'Unbekannt',
				totalKm: 0,
				activityCount: 0,
				activeDays: new Set<string>()
			});
		}

		const stats = statsByUser.get(userId);
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

	const awards = [
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
	];

	const daysRemainingForEntry = canAddEntries(challenge) ? getDaysRemainingForEntry(challenge) : 0;

	return { ...context, leaderboard, lastActivities, daysRemainingForEntry, awards };
});

export const getChallengeActivityData = query(challengeRouteSchema, async ({ clubId, challengeId }) => {
	const context = await getChallengeContext(clubId, challengeId);
	const { challenge, user } = context;

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
			user: true
		}
	});

	if (!membership) error(400);

	return { ...context, entries, membership };
});

export const getChallengeMembersData = query(challengeRouteSchema, async ({ clubId, challengeId }) => {
	const context = await getChallengeContext(clubId, challengeId);
	const { challenge } = context;

	const members = await db.query.challengeMember.findMany({
		where: { challengeId: challenge.id },
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

	const admins = await db.query.clubAdmin.findMany({ where: { clubId } });

	return { ...context, members, admins };
});

export const getChallengeMemberDetailsData = query(
	challengeMemberRouteSchema,
	async ({ clubId, challengeId, memberId }) => {
		const context = await getChallengeContext(clubId, challengeId);

		const qMember = await db.query.challengeMember.findFirst({
			where: { AND: [{ userId: memberId }, { challengeId }] },
			with: {
				user: {
					with: {
						entries: {
							where: {
								challengeId
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

		if (!qMember) error(404, 'Dieses Mitglied existiert nicht');

		return { ...context, member: qMember };
	}
);

export const getLeaderboard = query(
	z.object({ challengeId: z.string(), limit: z.number().optional() }),
	async ({ challengeId, limit = 10 }) => {
		return getLeaderBoard.execute({ challengeId, limit });
	}
);

export const addEntry = form(addEntrySchema, async ({ challengeId, disciplineId, amount, date }) => {
	const user = requireUser();

	const qDiscipline = await db.query.discipline.findFirst({ where: { id: disciplineId } });
	if (!qDiscipline) error(404, 'Disziplin nicht gefunden');

	const qChallenge = await db.query.challenge.findFirst({ where: { id: qDiscipline.challengeId } });
	if (!qChallenge) error(404, 'Challenge nicht gefunden');

	if (!canAddEntries(qChallenge)) error(403, 'Diese Challenge akzeptiert keine Einträge mehr');

	const entryDate = new Date(date);
	const challengeStart = new Date(qChallenge.startsAt);
	challengeStart.setUTCHours(0, 0, 0, 0);
	const challengeEnd = new Date(qChallenge.endsAt);
	challengeEnd.setUTCHours(23, 59, 59, 999);

	if (entryDate < challengeStart || entryDate > challengeEnd) {
		error(
			400,
			`Die Aktivität muss zwischen ${prettyDate(qChallenge.startsAt)} und ${prettyDate(qChallenge.endsAt)} stattgefunden haben`
		);
	}

	await db.insert(entry).values({
		amount: amount.toString(),
		challengeId,
		date: new Date(date),
		disciplineId,
		userId: user.id
	});
});

export const deleteChallenge = command(clubChallengeInput, async ({ clubId, challengeId }) => {
	const user = requireUser();
	const qChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!qChallenge) error(404, 'Challenge existiert nicht');

	const isAdmin = await checkAdmin(clubId, user.id);
	if (!isAdmin) error(401, 'Nicht erlaubt');

	await db.delete(challenge).where(eq(challenge.id, qChallenge.id));
	redirect(302, `/clubs/${qChallenge.clubId}`);
});

export const editChallenge = form(editChallengeSchema, async ({ clubId, challengeId, name, endsAt, startsAt }) => {
	const user = requireUser();
	const qChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!qChallenge) error(404, 'Challenge existiert nicht');

	const isAdmin = await checkAdmin(clubId, user.id);
	if (!isAdmin) error(401, 'Nicht erlaubt');

	await db
		.update(challenge)
		.set({
			name,
			endsAt: new Date(endsAt),
			startsAt: new Date(startsAt)
		})
		.where(eq(challenge.id, qChallenge.id));
});

export const leaveChallenge = command(challengeInput, async ({ challengeId }) => {
	const user = requireUser();

	const qChallengeMember = await db.query.challengeMember.findFirst({
		where: { AND: [{ challengeId }, { userId: user.id }] }
	});
	if (!qChallengeMember) error(404, 'Du bist kein Mitglied dieser Challenge');

	await db.delete(challengeMember).where(eq(challengeMember.id, qChallengeMember.id));
});

export const joinChallenge = command(clubChallengeInput, async ({ clubId, challengeId }) => {
	const user = requireUser();

	const clubRel = await db.query.clubMember.findFirst({
		where: { AND: [{ userId: user.id }, { clubId }] }
	});
	if (!clubRel) error(401, 'Du bist kein Mitglied des Clubs');

	await db.insert(challengeMember).values({ challengeId, userId: user.id });
});

export const addDisciplines = form(addDisciplinesSchema, async ({ challengeId, discipline: items }) => {
	const user = requireUser();
	const qChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!qChallenge) error(404, 'Challenge nicht gefunden');

	if (!(await checkAdmin(qChallenge.clubId, user.id))) error(401, 'Nicht erlaubt');

	for (const d of items) {
		await db.insert(discipline).values({
			factor: d.multiplier.toString(),
			name: d.name,
			challengeId
		});
	}
});

export const deleteDiscipline = command(deleteDisciplineSchema, async ({ challengeId, disciplineId }) => {
	const user = requireUser();
	const qChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!qChallenge) error(404, 'Challenge nicht gefunden');

	if (!(await checkAdmin(qChallenge.clubId, user.id))) error(401, 'Nicht erlaubt');

	const qDiscipline = await db.query.discipline.findFirst({
		where: { AND: [{ id: disciplineId }, { challengeId }] }
	});
	if (!qDiscipline) error(404, 'Disziplin nicht gefunden');

	await db.delete(discipline).where(eq(discipline.id, qDiscipline.id));
});

export const deleteEntry = command(deleteEntrySchema, async ({ challengeId, entryId }) => {
	const user = requireUser();

	const qEntry = await db.query.entry.findFirst({
		where: { id: entryId, challengeId }
	});
	if (!qEntry) error(404);
	if (qEntry.userId !== user.id) error(401);

	await db.delete(entry).where(eq(entry.id, qEntry.id));
});

export const getDaysRemainingForChallengeEntries = query(challengeInput, async ({ challengeId }) => {
	const qChallenge = await db.query.challenge.findFirst({ where: { id: challengeId } });
	if (!qChallenge) error(404);
	return {
		canAddEntries: canAddEntries(qChallenge),
		daysRemaining: getDaysRemainingForEntry(qChallenge)
	};
});
