<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, isAdmin }: { children: Snippet; isAdmin: boolean } = $props();
</script>

{#if isAdmin}
	{@render children()}
{/if}
