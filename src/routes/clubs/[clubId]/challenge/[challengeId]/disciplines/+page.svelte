<script lang="ts">
	import { page } from '$app/state';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import { deleteDisciplineCommand, getChallengePageContext } from '$lib/remote/challenges.remote';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';

	const clubId = $derived(page.params.clubId ?? '');
	const challengeId = $derived(page.params.challengeId ?? '');
	const challengePage = $derived(getChallengePageContext({ clubId, challengeId }));

	let disciplineDialogOpen = $state(false);
	let selectedDiscipline = $state<{ id: string; name: string } | null>(null);

	async function onDeleteDiscipline() {
		if (!selectedDiscipline) return;

		await deleteDisciplineCommand({
			clubId,
			challengeId,
			disciplineId: selectedDiscipline.id
		});

		selectedDiscipline = null;
		disciplineDialogOpen = false;
	}
</script>

<svelte:boundary>
	{@const data = await challengePage}
	{@const { challenge, clubAdmin: isAdmin, currentUserChallenge } = data}

	<main>
		<div>
			<h1 class="h1 mb-4">Diszipline</h1>
			<ul class="space-y-2">
				{#each challenge.disciplines as d (d.id)}
					<li class="flex justify-between gap-2">
						<span>
							{d.name} (x{d.factor})
						</span>
						<ClubAdmin {isAdmin}>
							<button
								class="text-destructive"
								type="button"
								onclick={() => {
									selectedDiscipline = { id: d.id, name: d.name };
									disciplineDialogOpen = true;
								}}
							>
								<Trash2 />
							</button>
						</ClubAdmin>
					</li>
				{/each}
			</ul>
		</div>
		{#if currentUserChallenge}
			<div class="flex gap-4 max-md:flex-col md:gap-8">
				<div>
					<ClubAdmin {isAdmin}>
						<DisciplineForm {challengeId} {clubId} />
					</ClubAdmin>
				</div>
			</div>
		{/if}
	</main>

	<AlertDialog.Root bind:open={disciplineDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Disziplin "{selectedDiscipline?.name}" löschen?</AlertDialog.Title>
				<AlertDialog.Description>
					Diese Aktion wird jeden Eintrag mit der gelöschten Disziplin auf 1 setzen. Diese Aktion
					kann nicht rückgängig gemacht werden.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action class={buttonVariants({ variant: 'destructive' })} onclick={onDeleteDiscipline}
					>Löschen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Disziplinen werden geladen...</p>
	{/snippet}
</svelte:boundary>
