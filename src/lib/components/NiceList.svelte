<script module lang="ts">
	export type ListItems = {
		name: string;
		content: string;
	}[];
</script>

<script lang="ts">
	interface Props {
		listItems: ListItems;
		className?: string;
	}

	let { listItems, className }: Props = $props();
</script>

<ul class={className}>
	{#each listItems as item (item.name)}
		<li>
			<span class="text-muted-foreground font-medium">{item.name}:</span>
			<span class="font-medium">{item.content}</span>
		</li>
	{/each}
</ul>
