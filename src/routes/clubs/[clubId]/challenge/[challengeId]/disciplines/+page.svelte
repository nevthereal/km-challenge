<script lang="ts">
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import { deleteDiscipline, getChallengeLayoutData } from '$lib/remote/challenge.remote';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { page } from '$app/state';

	const data = await getChallengeLayoutData({
		clubId: page.params.clubId ?? '',
		challengeId: page.params.challengeId ?? ''
	});

	let openDisciplineId = $state<string | null>(null);
</script>

<main>
	<div>
		<h1 class="h1 mb-4">Diszipline</h1>
		<ul>
			{#each data.challenge.disciplines as d}
				<li class="flex justify-between gap-2">
					<span>{d.name} (x{d.factor})</span>
					<ClubAdmin isAdmin={data.clubAdmin}>
						<AlertDialog.Root
							open={openDisciplineId === d.id}
							onOpenChange={(open) => {
								openDisciplineId = open ? d.id : null;
							}}
						>
							<AlertDialog.Trigger
								class="text-destructive"
								onclick={() => {
									openDisciplineId = d.id;
								}}
								><Trash2 /></AlertDialog.Trigger
							>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Disziplin "{d.name}" löschen?</AlertDialog.Title>
									<AlertDialog.Description>Diese Aktion wird jeden Eintrag mit der gelöschten Disziplin auf 1 setzen. Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										onclick={async () => {
											await deleteDiscipline({ challengeId: data.challenge.id, disciplineId: d.id });
											await getChallengeLayoutData({ clubId: page.params.clubId ?? '', challengeId: page.params.challengeId ?? '' }).refresh();
										}}
										class={buttonVariants({ variant: 'destructive' })}
										>Continue</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</ClubAdmin>
				</li>
			{/each}
		</ul>
	</div>
	{#if data.currentUserChallenge}
		<div class="flex gap-4 max-md:flex-col md:gap-8">
			<div><ClubAdmin isAdmin={data.clubAdmin}><DisciplineForm challengeId={data.challenge.id} clubId={data.challenge.clubId} /></ClubAdmin></div>
		</div>
	{/if}
</main>
