import { dev } from '$app/environment';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: dev ? 'http://localhost:5173' : 'https://km.nevillebrem.com'
});
