<script lang="ts">
	import { Trash } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Card from '$lib/components/ui/card';
	import { buttonVariants } from './ui/button/button.svelte';
	import {
		getChallengeAwardsData,
		deleteEntry,
		getChallengeActivityData,
		getChallengeLayoutData,
		getChallengeLastActivitiesData,
		getChallengeLeaderboardData,
		getHomeActiveChallengesData,
		getHomeOpenEntriesData
	} from '$lib/remote/challenge.remote';
	import { entry as dbEntry, discipline as dbDiscipline } from '$lib/db/schema';

	interface Props {
		entry: typeof dbEntry.$inferSelect;
		discipline: typeof dbDiscipline.$inferSelect | null;
		edit: boolean;
		challengePath: string;
	}

	let { entry, discipline, edit, challengePath }: Props = $props();

	let open = $state(false);
	const pathSegments = $derived(challengePath.split('/'));
	const clubId = $derived(pathSegments[2] ?? '');
	const challengeId = $derived(pathSegments[4] ?? '');
</script>

<Card.Root>
	<Card.Header>
		<Card.Title
			>{discipline?.name ?? 'Aktivität'} am {Intl.DateTimeFormat('de', {
				dateStyle: 'medium'
			}).format(entry.date)}</Card.Title
		>
	</Card.Header>
	<Card.Content class="flex items-center justify-between">
		<p>
			{(Number(entry.amount) * Number(discipline?.factor ?? 1)).toFixed(1)} Punkte
			<span class="text-muted-foreground font-mono">({entry.amount}km)</span>
		</p>
		{#if edit}
			{@render deleteDialog()}
		{/if}
	</Card.Content>
</Card.Root>

{#snippet deleteDialog()}
	<AlertDialog.Root bind:open>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive', size: 'icon' })}>
			<Trash />
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Disziplin löschen?</AlertDialog.Title>
				<AlertDialog.Description
					>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialog.Description
				>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={async () => {
						await deleteEntry({ challengeId, entryId: entry.id }).updates(
							getChallengeActivityData({ clubId, challengeId }).withOverride((data) => ({
								...data,
								entries: data.entries.filter((currentEntry) => currentEntry.id !== entry.id)
							})),
							getChallengeLeaderboardData({ clubId, challengeId }),
							getChallengeLastActivitiesData({ clubId, challengeId }),
							getChallengeAwardsData({ clubId, challengeId }),
							getChallengeLayoutData({ clubId, challengeId }),
							getHomeActiveChallengesData(),
							getHomeOpenEntriesData()
						);
						open = false;
					}}
					class={buttonVariants({ variant: 'destructive' })}>Löschen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
