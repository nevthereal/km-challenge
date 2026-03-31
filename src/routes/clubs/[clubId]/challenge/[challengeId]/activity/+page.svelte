<script lang="ts">
	import { page } from '$app/state';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import NiceList from '$lib/components/NiceList.svelte';
	import { getUserChallengeActivity } from '$lib/remote/challenges.remote';
	import { prettyDate } from '$lib/utils';

	const clubId = $derived(page.params.clubId ?? '');
	const challengeId = $derived(page.params.challengeId ?? '');
	const activityPage = $derived(getUserChallengeActivity({ clubId, challengeId }));
</script>

<svelte:boundary>
	{@const data = await activityPage}
	{@const listItems = [
		{
			name: 'Beigetreten am',
			content: prettyDate(data.membership.joinedAt!)
		},
		{
			name: 'Kategorie',
			content: data.membership.user?.role ?? 'Nicht angegeben'
		},
		{
			name: 'Geschlecht',
			content: data.membership.user?.gender ?? 'Nicht angegeben'
		}
	] satisfies ListItems}

	<h1 class="h1 mb-4">Deine Aktivität</h1>
	<NiceList {listItems} />
	<h2 class="h2 my-4">
		Einträge ({data.entries.length !== 0 ? data.entries.length.toString() : 'keine'}):
	</h2>
	<div class="mt-4 flex flex-col gap-4">
		{#each data.entries as entry (entry.id)}
			<EntryCard {entry} {clubId} discipline={entry.discipline} edit />
		{:else}
			<p class="font-mono italic font-bold">Noch keine Aktivität</p>
		{/each}
	</div>

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Aktivität wird geladen...</p>
	{/snippet}
</svelte:boundary>
