<script>
	import { enhance } from '$app/forms';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Trash2 } from 'lucide-svelte';

	let { data } = $props();
	const { challenge, clubAdmin: isAdmin, currentUserChallenge } = $derived(data);
	let disciplineDialogOpen = $state(false);
</script>

<main>
	<div>
		<h1 class="h1 mb-4">Diszipline</h1>
		<ul>
			{#each challenge.disciplines as d}
				<li class="flex justify-between gap-2">
					<span>
						{d.name} (x{d.factor})
					</span>
					<ClubAdmin {isAdmin}>
						<AlertDialog.Root bind:open={disciplineDialogOpen}>
							<AlertDialog.Trigger class="text-destructive"><Trash2 /></AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Disziplin "{d.name}" löschen?</AlertDialog.Title>
									<AlertDialog.Description>
										Diese Aktion wird jeden Eintrag mit der gelöschten Disziplin auf 1 setzen. Diese
										Aktion kann nicht rückgängig gemacht werden.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										form="deleteForm"
										value={d.id}
										name="id"
										class={buttonVariants({ variant: 'destructive' })}>Continue</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</ClubAdmin>
				</li>
			{/each}
		</ul>
	</div>
	{#if currentUserChallenge}
		<div class="flex gap-4 max-md:flex-col md:gap-8">
			<div>
				<ClubAdmin {isAdmin}>
					<DisciplineForm formData={data.addDisciplineForm} />
				</ClubAdmin>
			</div>
		</div>
	{/if}
</main>

<form id="deleteForm" action="?/delete" method="post" use:enhance hidden></form>
