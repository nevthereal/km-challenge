<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import { LogIn, LogOut } from 'lucide-svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';

	let { children, data } = $props();

	let { session } = data;
</script>

<ModeWatcher defaultMode="dark" />
<nav class="flex items-center justify-between p-6">
	<div class="flex items-center gap-4">
		<a href="/" class="text-4xl font-bold">Startseite</a>
		<div class="contents">
			<a href="/clubs" class="text-lg font-semibold">Clubs</a>
		</div>
	</div>
	{#if !session}
		<Button
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'google',
					callbackURL: page.url.pathname,
					newUserCallbackURL: '/profile/new'
				});
			}}><LogIn />Mit Google anmelden</Button
		>
	{:else}
		<div class="flex gap-2">
			<Button
				onclick={async () => {
					await authClient.signOut({
						fetchOptions: {
							onSuccess: () => {
								location.reload();
							}
						}
					});
					location.reload();
				}}
				><LogOut /><span>
					{session.user.name} Abmelden
				</span>
			</Button>
		</div>
	{/if}
</nav>
<div class="mx-8 my-4">
	{@render children()}
</div>
