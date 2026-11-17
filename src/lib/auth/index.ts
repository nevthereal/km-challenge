import { betterAuth } from 'better-auth';
import { dev } from '$app/env';
import { getAuthBaseURL } from './base-url';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import * as schema from '../db/schema';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import {
	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$app/env/private';

export const auth = betterAuth({
	plugins: [sveltekitCookies(getRequestEvent)],
	baseURL: getAuthBaseURL(dev, BETTER_AUTH_URL),
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	secret: BETTER_AUTH_SECRET,
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				input: true,
				required: false
			},
			admin: {
				type: 'boolean',
				defaultValue: false,
				input: false
			},
			gender: {
				type: 'string',
				input: true,
				required: false
			}
		}
	},
	session: {
		cookieCache: {
			enabled: true
		}
	}
});

export type Auth = typeof auth;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
