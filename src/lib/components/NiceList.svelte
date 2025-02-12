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
	{#each listItems as item}
		<li>
			<span class="font-medium text-muted-foreground">{item.name}:</span>
			<span class="font-medium">{item.content}</span>
		</li>
	{/each}
</ul>
