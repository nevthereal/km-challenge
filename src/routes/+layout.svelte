<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';
	import '../app.css';

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
		<h1>Sign in</h1>
		<Button
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'google'
				});
			}}><LogIn />Mit Google anmelden</Button
		>
	{:else}
		<h1>Angemeldet als {session.user.name}</h1>
	{/if}
</nav>
<div class="mx-8 my-4">
	{@render children()}
</div>
