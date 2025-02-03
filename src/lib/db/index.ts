import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import * as relations from './relations';
import { sql, eq, desc } from 'drizzle-orm';

const client = neon(DATABASE_URL);
export const db = drizzle(client, { casing: 'snake_case', schema: { ...schema, ...relations } });

export async function getLeaderBoard(challengeId: string) {
	return await db
		.select({
			username: schema.user.name,
			score: sql<number>`round(sum(${schema.entry.amount} * ${schema.discipline.factor}), 2)`.as(
				'score'
			),
			totalEntries: sql<number>`count(${schema.entry.id})`.as('total_entries'),
			lastActivity: sql<Date>`max(${schema.entry.date})`.as('last_activity'),
			role: schema.user.role,
			gender: schema.user.gender
		})
		.from(schema.entry)
		.innerJoin(schema.discipline, eq(schema.entry.disciplineId, schema.discipline.id))
		.innerJoin(schema.user, eq(schema.entry.userId, schema.user.id))
		.where(eq(schema.entry.challengeId, challengeId))
		.groupBy(schema.user.id)
		.orderBy(desc(sql`score`));
}

export type Leaderboard = ReturnType<typeof getLeaderBoard>;
