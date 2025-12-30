<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth/client';
	import GoogleLogo from '$lib/components/GoogleLogo.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';

	const redirectUrl = page.url.searchParams.get('redirect');
	let loading = $state(false);
</script>

<main class="flex h-[80vh] items-center justify-center">
	<Button
		variant="outline"
		size="lg"
		onclick={async () => {
			loading = true;
			const editString = `${page.url.origin}/profile/edit`;
			await authClient(page.url.origin).signIn.social({
				provider: 'google',
				callbackURL: redirectUrl || '/',
				newUserCallbackURL:
					redirectUrl != null ? editString + `?redirect=${redirectUrl}` : editString
			});
		}}
	>
		{#if loading}
			<Spinner />
		{:else}
			<GoogleLogo />
		{/if}
		Mit Google anmelden</Button
	>
</main>
