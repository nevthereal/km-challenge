import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from '$env/static/private';
import relations from './relations';
import { sql, eq, desc, getColumns } from 'drizzle-orm';
import * as schema from './schema';

export const db = drizzle(DATABASE_URL, {
	casing: 'snake_case',
	schema,
	relations
});

export const getLeaderBoard = db
	.select({
		...getColumns(schema.user),
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
	.where(eq(schema.entry.challengeId, sql.placeholder('challengeId')))
	.groupBy(schema.user.id)
	.orderBy(desc(sql`score`))
	.limit(sql.placeholder('limit'))
	.prepare('leaderboard');

export type Leaderboard = ReturnType<typeof getLeaderBoard.execute>;

export async function checkAdmin(clubId: string, userId: string) {
	const query = await db.query.clubAdmin.findFirst({
		where: { userId, clubId }
	});

	return !!query;
}
