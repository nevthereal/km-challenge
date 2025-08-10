import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import * as relations from './relations';
import { sql, eq, desc, and, getTableColumns } from 'drizzle-orm';

const client = neon(DATABASE_URL);
export const db = drizzle(client, {
	casing: 'snake_case',
	schema: { ...schema, ...relations }
});

export async function getLeaderBoard(challengeId: string, limit?: number) {
	const lb = db
		.select({
			...getTableColumns(schema.user),
			score:
				sql<number>`round(sum(${schema.entry.amount} * COALESCE(${schema.discipline.factor}, 1)), 2)`.as(
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
		.orderBy(desc(sql`score`));

	if (limit) return await lb.limit(limit);

	return await lb;
}

export type Leaderboard = ReturnType<typeof getLeaderBoard>;

export async function checkAdmin(clubId: string, userId: string) {
	const query = await db.query.clubAdmin.findFirst({
		where: and(eq(schema.clubAdmin.userId, userId), eq(schema.clubAdmin.clubId, clubId))
	});

	if (query) return true;

	return false;
}
