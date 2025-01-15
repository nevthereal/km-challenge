<script>
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth/client';
	import { LogIn } from 'lucide-svelte';

	const session = authClient.useSession();
</script>

{#if !$session.data}
	<h1>Sign in</h1>
	<Button
		onclick={async () => {
			await authClient.signIn.social({
				provider: 'google'
			});
		}}><LogIn />Log in with Google</Button
	>
{:else}
	<h1>{$session.data.user.name}</h1>
{/if}
