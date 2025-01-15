<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import { LogIn, LogOut } from 'lucide-svelte';
	import '../app.css';
	import { redirect } from '@sveltejs/kit';

	let { children, data } = $props();

	let { session } = data;
</script>

<nav class="flex items-center justify-between p-6">
	<div class="flex items-center gap-4">
		<a href="/" class="text-4xl font-bold">Start</a>
		<div class="contents">
			<a href="/challenges">Challenges</a>
		</div>
	</div>
	{#if !session}
		<Button
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'google',
					callbackURL: '/'
				});
			}}><LogIn />Mit Google anmelden</Button
		>
	{:else}
		<div class="flex gap-2">
			<Button
				onclick={async () => {
					await authClient.signOut();
					location.reload();
				}}><LogOut />{session.user.name} Abmelden</Button
			>
		</div>
	{/if}
</nav>
<div class="mx-8 my-4">
	{@render children()}
</div>
