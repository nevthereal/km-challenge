<script lang="ts">
	import { entry as dbEntry, discipline as dbDiscipline } from '$lib/db/schema';
	import { deleteEntryCommand, getChallengeOverview, getChallengePageContext, getUserChallengeActivity } from '$lib/remote/challenges.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from './ui/button/button.svelte';
	import { Trash } from '@lucide/svelte';

	interface Props {
		entry: typeof dbEntry.$inferSelect;
		discipline: typeof dbDiscipline.$inferSelect | null;
		edit: boolean;
		clubId: string;
	}

	let { entry, discipline, edit, clubId }: Props = $props();

	let open = $state(false);

	async function onDelete() {
		await deleteEntryCommand({
			challengeId: entry.challengeId,
			entryId: entry.id
		}).updates(
			getChallengePageContext({ clubId, challengeId: entry.challengeId }),
			getChallengeOverview({ clubId, challengeId: entry.challengeId }),
			getUserChallengeActivity({ clubId, challengeId: entry.challengeId })
		);

		open = false;
	}
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
				<AlertDialog.Action class={buttonVariants({ variant: 'destructive' })} onclick={onDelete}
					>Löschen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
