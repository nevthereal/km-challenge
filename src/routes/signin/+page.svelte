<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/client';

	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';

	const redirectUrl = page.url.searchParams.get('redirect');
</script>

<main class="flex h-[80vh] w-screen items-center justify-center">
	<Button
		size="lg"
		onclick={async () => {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: redirectUrl || '/',
				newUserCallbackURL: `/profile/edit${redirectUrl && `?redirect=${redirectUrl}`}`
			});
		}}><LogIn />Mit Google anmelden</Button
	>
</main>
