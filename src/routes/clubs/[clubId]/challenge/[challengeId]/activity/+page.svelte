<script lang="ts">
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import NiceList from '$lib/components/NiceList.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { prettyDate } from '$lib/utils';
	import { Pencil, Trash2 } from 'lucide-svelte';

	let { data } = $props();

	let { entries, membership } = $derived(data);

	const listItems: ListItems = $derived([
		{
			name: 'Beigetreten am',
			content: prettyDate(membership.joinedAt!)
		},
		{
			name: 'Kategorie',
			content: membership.user.role ?? 'Nicht angegeben'
		},
		{
			name: 'Geschlecht',
			content: membership.user.gender ?? 'Nicht angegeben'
		}
	]);
</script>

<h1 class="h1 mb-4">Deine Aktivität</h1>
<NiceList {listItems} />
<h2 class="h2 my-4">
	Einträge ({entries.length != 0 ? entries.length.toString() : 'keine'}):
</h2>
<div class="mt-4 flex flex-col gap-4">
	{#each entries as entry}
		<Card.Root>
			<Card.Header>
				<Card.Title
					>{entry.discipline?.name ?? 'Aktivität'} am {Intl.DateTimeFormat('de', {
						dateStyle: 'medium'
					}).format(entry.createdAt)}</Card.Title
				>
			</Card.Header>
			<Card.Content class="flex items-center justify-between">
				<p>
					{Number(entry.amount) * Number(entry.discipline?.factor ?? 1)} Punkte
					<span class="font-mono text-muted-foreground">({entry.amount}km)</span>
				</p>
				<!-- <div class="flex gap-2">
					<Button variant="ghost" size="icon" class="text-primary"><Pencil /></Button>
					<Button variant="ghost" size="icon" class="text-destructive"><Trash2 /></Button>
				</div> -->
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="italic font-mono font-bold">Noch keine Aktivität</p>
	{/each}
</div>
