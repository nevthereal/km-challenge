<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/client';

	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';

	const redirectUrl = page.url.searchParams.get('redirect');
</script>

<Button
	onclick={async () => {
		await authClient.signIn.social({
			provider: 'google',
			callbackURL: redirectUrl || '/',
			newUserCallbackURL: '/profile/new'
		});
	}}><LogIn />Mit Google anmelden</Button
>
