<script lang="ts">
	import EntryCard from '$lib/components/EntryCard.svelte';
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import NiceList from '$lib/components/NiceList.svelte';
	import { prettyDate } from '$lib/utils';
	import { page } from '$app/state';
	import { getChallengeActivityData } from '$lib/remote/challenge.remote';

	const data = await getChallengeActivityData({
		clubId: page.params.clubId ?? '',
		challengeId: page.params.challengeId ?? ''
	});

	let { entries, membership, challengePath } = data;

	const listItems: ListItems = [
		{ name: 'Beigetreten am', content: prettyDate(membership.joinedAt!) },
		{ name: 'Kategorie', content: membership.user?.role ?? 'Nicht angegeben' },
		{ name: 'Geschlecht', content: membership.user?.gender ?? 'Nicht angegeben' }
	];
</script>

<h1 class="h1 mb-4">Deine Aktivität</h1>
<NiceList {listItems} />
<h2 class="h2 my-4">Einträge ({entries.length != 0 ? entries.length.toString() : 'keine'}):</h2>
<div class="mt-4 flex flex-col gap-4">
	{#each entries as entry}
		<EntryCard {entry} discipline={entry.discipline} edit {challengePath} />
	{:else}
		<p class="italic font-mono font-bold">Noch keine Aktivität</p>
	{/each}
</div>
