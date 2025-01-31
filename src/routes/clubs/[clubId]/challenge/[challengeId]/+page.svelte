<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { prettyDate } from '$lib/utils';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, Trash2 } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { data } = $props();

	let dialogOpen = $state(false);

	const { challenge } = $derived(data);
	const { currentUserChallenge } = data;
</script>

<nav class="mb-4">
	<a
		href={`/clubs/${challenge.clubId}`}
		class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Zum Club</a
	>
</nav>

<h1 class="h1">Challenge: {challenge.name}</h1>
{#if currentUserChallenge}
	<div class="mt-6 flex gap-8 p-6 max-md:flex-col-reverse">
		<div class="flex-grow">
			<h2 class="h2">Rangliste:</h2>
			<EntryForm disciplines={challenge.disciplines} formData={data.newEntryForm} />
			<Table.Root class="mt-8">
				<Table.Header>
					<Table.Row>
						<Table.Head>Rang</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Punktzahl</Table.Head>
						<Table.Head>Geschlecht / Kategorie</Table.Head>
						<Table.Head>Zuletzt aktiv</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#await data.leaderboard}
						{#each { length: 4 }}
							<Table.Row>
								{#each { length: 5 }}
									<Table.Cell class="text-center"><Skeleton class="h-4 w-full" /></Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{:then leaderboard}
						{#each leaderboard as competitor, idx}
							<Table.Row>
								<Table.Cell class="font-medium">{idx + 1}</Table.Cell>
								<Table.Cell class="font-medium">{competitor.username}</Table.Cell>
								<Table.Cell>{competitor.score}</Table.Cell>
								<Table.Cell>{competitor.gender} / {competitor.role}</Table.Cell>
								<Table.Cell>{prettyDate(new Date(competitor.lastActivity))}</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={5} class="text-center">
									<p class="text-lg font-bold text-destructive">No entries yet</p>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/await}
				</Table.Body>
			</Table.Root>
		</div>
		<div>
			<h2 class="h2">Diszipline:</h2>
			<ul>
				{#each challenge.disciplines as d}
					<li class="mb-2 flex justify-between gap-2">
						<span>
							{d.name} (x{d.factor})
						</span>
						<AlertDialog.Root bind:open={dialogOpen}>
							<AlertDialog.Trigger class="text-destructive"><Trash2 /></AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Disziplin "{d.name}" löschen?</AlertDialog.Title>
									<AlertDialog.Description>
										Diese Aktion wird jeden Eintrag mit der gelöschten Disziplin auch löschen. Diese
										Aktion kann nicht rückgängig gemacht werden.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										onclick={async () => {
											await fetch(`/api/delete-discipline?id=${d.id}`, {
												method: 'post'
											});
											dialogOpen = !dialogOpen;
											invalidateAll();
										}}
										class={buttonVariants({ variant: 'destructive' })}>Continue</AlertDialog.Action
									>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</li>
				{:else}
					<p class="text-destructive font-medium">Keine diszipline</p>
				{/each}
			</ul>

			{#if data.user.superUser}
				<DisciplineForm formData={data.addDisciplineForm} />
			{/if}
		</div>
	</div>
{:else}
	<div>
		<Button
			onclick={async () => {
				await fetch(`/api/join-challenge?id=${challenge.id}`, {
					method: 'post'
				});
				location.reload();
			}}>Challenge beitreten</Button
		>
	</div>
{/if}
