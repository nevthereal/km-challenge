<script>
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth/client';
	import { LogIn } from 'lucide-svelte';

	let { data } = $props();

	let { activeChallenges } = data;
</script>

{#each activeChallenges as challenge}
	<div>
		<h1>{challenge.name}</h1>
	</div>
{/each}
