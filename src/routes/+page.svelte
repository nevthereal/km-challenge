<script>
	import { Button } from '$lib/components/ui/button';
	import { LogIn } from 'lucide-svelte';

	let { data } = $props();

	const { user } = data;
</script>

{#if !user}
	<h1>Sign in</h1>
	<Button href="/api/google"><LogIn />Log in with Google</Button>
{:else}
	<p>Signed in</p>
{/if}
