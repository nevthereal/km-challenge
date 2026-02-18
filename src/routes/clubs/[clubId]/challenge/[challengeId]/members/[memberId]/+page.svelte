<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import NiceList, { type ListItems } from '$lib/components/NiceList.svelte';
	import { prettyDate } from '$lib/utils';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import EntryMetricsChart from '$lib/components/EntryMetricsChart.svelte';

	let { data } = $props();

	let { member, challengePath } = $derived(data);

	const listItems: ListItems = $derived([
		{
			name: 'Beigetreten am',
			content: prettyDate(member.joinedAt!)
		},
		{
			name: 'Kategorie',
			content: member.user?.role ?? 'Nicht angegeben'
		},
		{
			name: 'Geschlecht',
			content: member.user?.gender ?? 'Nicht angegeben'
		}
	]);
</script>

<div class="mb-4 flex">
	<a
		href="{data.challengePath}/members"
		class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
		><ArrowLeft strokeWidth={3} /> Alle Mitglieder</a
	>
</div>
<h1 class="h1 mb-4">
	{member.user?.name ?? 'Unbekannt'}
</h1>
<div class="mt-2">
	<NiceList {listItems} />
</div>

<EntryMetricsChart title="Fortschritt (Kilometer, Punkte)" entries={member.user?.entries ?? []} />

<h2 class="h2 my-4">
	Einträge ({member.user?.entries.length ?? 0}):
</h2>
<div class="mt-4 flex flex-col gap-4">
	{#each member.user?.entries ?? [] as entry}
		<EntryCard {entry} discipline={entry.discipline} edit={false} {challengePath} />
	{:else}
		<p class="italic font-mono font-bold">Noch keine Aktivität</p>
	{/each}
</div>
