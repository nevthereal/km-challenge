<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { page } from '$app/state';
	import NiceList, { type ListItems } from '$lib/components/NiceList.svelte';
	import { getChallengeMember } from '$lib/remote/challenges.remote';
	import { prettyDate } from '$lib/utils';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import EntryMetricsChart from '$lib/components/EntryMetricsChart.svelte';

	const clubId = $derived(page.params.clubId ?? '');
	const challengeId = $derived(page.params.challengeId ?? '');
	const memberId = $derived(page.params.memberId ?? '');
	const memberPage = $derived(getChallengeMember({ clubId, challengeId, memberId }));
</script>

<svelte:boundary>
	{@const data = await memberPage}
	{@const listItems = [
		{
			name: 'Beigetreten am',
			content: prettyDate(data.member.joinedAt!)
		},
		{
			name: 'Kategorie',
			content: data.member.user?.role ?? 'Nicht angegeben'
		},
		{
			name: 'Geschlecht',
			content: data.member.user?.gender ?? 'Nicht angegeben'
		}
	] satisfies ListItems}

	<div class="mb-4 flex">
		<a
			href="{data.challengePath}/members"
			class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
			><ArrowLeft strokeWidth={3} /> Alle Mitglieder</a
		>
	</div>
	<h1 class="h1 mb-4">
		{data.member.user?.name ?? 'Unbekannt'}
	</h1>
	<div class="mt-2">
		<NiceList {listItems} />
	</div>

	<EntryMetricsChart title="Fortschritt (Kilometer, Punkte)" entries={data.member.user?.entries ?? []} />

	<h2 class="h2 my-4">
		Einträge ({data.member.user?.entries.length ?? 0}):
	</h2>
	<div class="mt-4 flex flex-col gap-4">
		{#each data.member.user?.entries ?? [] as entry (entry.id)}
			<EntryCard {entry} {clubId} discipline={entry.discipline} edit={false} />
		{:else}
			<p class="font-mono italic font-bold">Noch keine Aktivität</p>
		{/each}
	</div>

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Mitglied wird geladen...</p>
	{/snippet}
</svelte:boundary>
