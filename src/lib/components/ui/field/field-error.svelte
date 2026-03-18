<script lang="ts">
	import { cn } from '$lib/utils';

	type Issue = { message: string };
	type Props = {
		issues?: Issue[];
		class?: string;
	};

	let { issues = [], class: className = '' }: Props = $props();
</script>

{#if issues.length > 0}
	<ul class={cn('text-destructive text-sm', className)}>
		{#each issues as issue}
			<li>{issue.message}</li>
		{/each}
	</ul>
{/if}
