import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { createAuthClient } from 'better-auth/svelte';
import type { Auth } from './index';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: PUBLIC_BETTER_AUTH_URL,
	plugins: [inferAdditionalFields<Auth>()]
});
