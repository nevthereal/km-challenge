import { z } from 'zod';
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: { static: true },
	BETTER_AUTH_URL: { schema: z.string().url().optional() },
	BETTER_AUTH_SECRET: { static: true },
	GOOGLE_CLIENT_ID: { static: true },
	GOOGLE_CLIENT_SECRET: { static: true }
});
