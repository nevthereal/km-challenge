<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Separator } from '$lib/components/ui/separator';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, LogIn, LogOut, Trash2 } from 'lucide-svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { cn } from '$lib/utils';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let disciplineDialogOpen = $state(false);
	let challengeDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);

	const { challenge, leaderboard } = $derived(data);
	const { currentUserChallenge } = data;

	const isAdmin = data.clubAdmin;
</script>

<nav class="mb-4 flex">
	<a
		href={`/clubs/${challenge.clubId}`}
		class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Zum Club</a
	>
</nav>

<main class="p-4">
	<div class="flex justify-between pb-4 max-md:flex-col max-md:gap-4">
		<h1 class="h1">{challenge.name}</h1>
		<div class="flex items-center gap-2">
			<ClubAdmin {isAdmin}>
				<AlertDialog.Root bind:open={challengeDialogOpen}>
					<AlertDialog.Trigger class={cn(buttonVariants({ variant: 'destructive' }), 'my-auto')}>
						<Trash2 /><span class="max-md:hidden">Challenge löschen</span>
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Challenge "{challenge.name}" löschen?</AlertDialog.Title>
							<AlertDialog.Description>
								Diese Aktion wird die Challenge mit allen Einträgen und Disziplinen löschen. Diese
								Aktion kann nicht rückgängig gemacht werden.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								form="deleteForm"
								class={buttonVariants({ variant: 'destructive' })}>Continue</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</ClubAdmin>
			{#if currentUserChallenge}
				<AlertDialog.Root bind:open={leaveDialogOpen}>
					<AlertDialog.Trigger class={buttonVariants({ variant: 'secondary' })}>
						<LogOut />Verlassen
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Challenge "{challenge.name}" verlassen?</AlertDialog.Title>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
							<AlertDialog.Action
								form="leaveForm"
								class={buttonVariants({ variant: 'destructive' })}>Verlassen</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{:else}
				<Button
					onclick={async () => {
						await fetch(`/api/join-challenge?id=${challenge.id}`, {
							method: 'post'
						});
						location.reload();
					}}><LogIn />Beitreten</Button
				>
			{/if}
		</div>
	</div>
	<Separator class="mb-4" />
	{#if currentUserChallenge}
		<div class="flex gap-4 max-md:flex-col md:gap-8">
			<div class="flex-grow">
				<div class="flex items-center justify-between">
					<h2 class="h2 mb-2">Rangliste</h2>
					<EntryForm {challenge} disciplines={challenge.disciplines} formData={data.newEntryForm} />
				</div>
				<Leaderboard {leaderboard} />
			</div>
			<Separator class="mb-4" orientation="vertical" />
			<Separator class="md:hidden" orientation="horizontal" />
			<div>
				<div>
					<h2 class="h2 mb-2">Diszipline</h2>
					<ul>
						{#each challenge.disciplines as d}
							<li class="mb-2 flex justify-between gap-2">
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
													Diese Aktion wird jeden Eintrag mit der gelöschten Disziplin auf 1 setzen.
													Diese Aktion kann nicht rückgängig gemacht werden.
												</AlertDialog.Description>
											</AlertDialog.Header>
											<AlertDialog.Footer>
												<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
												<AlertDialog.Action
													form="deleteForm"
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

				<ClubAdmin {isAdmin}>
					<DisciplineForm formData={data.addDisciplineForm} />
				</ClubAdmin>
			</div>
		</div>
	{/if}
</main>

<form id="deleteForm" hidden action="?/deleteChallenge" use:enhance method="post"></form>
<form id="leaveForm" action="?/leave" method="post" use:enhance hidden></form>
