<script lang="ts">
	import { entry as dbEntry, discipline as dbDiscipline } from '$lib/db/schema';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from './ui/button/button.svelte';
	import { Trash } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	interface Props {
		entry: typeof dbEntry.$inferSelect;
		discipline: typeof dbDiscipline.$inferSelect | null;
		edit: boolean;
		challengePath: string;
	}

	let { entry, discipline, edit, challengePath }: Props = $props();

	let open = $state(false);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title
			>{discipline?.name ?? 'Aktivität'} am {Intl.DateTimeFormat('de', {
				dateStyle: 'medium'
			}).format(entry.createdAt)}</Card.Title
		>
	</Card.Header>
	<Card.Content class="flex items-center justify-between">
		<p>
			{(Number(entry.amount) * Number(discipline?.factor ?? 1)).toFixed(1)} Punkte
			<span class="font-mono text-muted-foreground">({entry.amount}km)</span>
		</p>
		{#if edit}
			{@render deleteDialog()}
		{/if}
	</Card.Content>
</Card.Root>

<form use:enhance method="post" id="deleteForm" action="{challengePath}/activity/?/delete"></form>

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
					value={entry.id}
					name="id"
					form="deleteForm"
					onclick={() => (open = false)}
					class={buttonVariants({ variant: 'destructive' })}>Löschen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
