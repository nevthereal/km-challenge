<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import NiceList, { type ListItems } from '$lib/components/NiceList.svelte';
	import { prettyDate } from '$lib/utils';
	import EntryCard from '$lib/components/EntryCard.svelte';

	let { data } = $props();

	let { member } = $derived(data);

	const listItems: ListItems = $derived([
		{
			name: 'Beigetreten am',
			content: prettyDate(member.joinedAt!)
		},
		{
			name: 'Kategorie',
			content: member.user.role ?? 'Nicht angegeben'
		},
		{
			name: 'Geschlecht',
			content: member.user.gender ?? 'Nicht angegeben'
		}
	]);
</script>

<div class="mb-4 flex">
	<a
		href="{data.challengePath}/members"
		class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Alle Mitglieder</a
	>
</div>
<h1 class="h1 mb-4">
	{member.user.name}
</h1>
<div class="mt-2">
	<NiceList {listItems} />
</div>

<h2 class="h2 my-4">
	Einträge ({member.user.entries.length != 0 ? member.user.entries.length.toString() : 'keine'}):
</h2>
<div class="mt-4 flex flex-col gap-4">
	{#each member.user.entries as entry}
		<EntryCard {entry} discipline={entry.discipline} edit={false} />
	{:else}
		<p class="italic font-mono font-bold">Noch keine Aktivität</p>
	{/each}
</div>
