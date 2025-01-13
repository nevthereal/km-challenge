import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const client = neon(DATABASE_URL);
export const db = drizzle(client, { casing: 'snake_case', schema });
