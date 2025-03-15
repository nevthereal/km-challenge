<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/client';
	import GoogleLogo from '$lib/components/GoogleLogo.svelte';

	import { Button } from '$lib/components/ui/button';

	const redirectUrl = page.url.searchParams.get('redirect');
</script>

<main class="flex h-[80vh] items-center justify-center">
	<Button
		variant="outline"
		size="lg"
		onclick={async () => {
			await authClient(page.url.origin).signIn.social({
				provider: 'google',
				callbackURL: redirectUrl || '/',
				newUserCallbackURL: `${page.url.origin}/profile/edit${redirectUrl && `?redirect=${redirectUrl}`}`
			});
		}}><GoogleLogo />Mit Google anmelden</Button
	>
</main>
