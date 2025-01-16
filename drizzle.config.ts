import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/db/schema.ts',

	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	casing: 'snake_case',

	verbose: true,
	strict: true,
	dialect: 'postgresql'
});
