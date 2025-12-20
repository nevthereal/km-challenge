import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import relations from './relations';

export const db = drizzle(DATABASE_URL, {
	casing: 'snake_case',
	schema: schema,
	relations
});

// and(eq(schema.clubAdmin.userId, userId), eq(schema.clubAdmin.clubId, clubId))
