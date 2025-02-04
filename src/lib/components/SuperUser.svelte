<script lang="ts">
	import type { User } from '$lib/auth';
	import type { FullUser } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { children, user }: { children: Snippet; user: FullUser } = $props();
</script>

{#if user.superUser}
	{@render children()}
{/if}
