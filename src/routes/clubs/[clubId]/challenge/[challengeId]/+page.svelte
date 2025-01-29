<script lang="ts">
	import * as Table from '$lib/components/ui/table/index';
	import { prettyDate } from '$lib/utils';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	const { challenge } = $derived(data);
	const { currentUserChallenge } = data;
</script>

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
					{#each data.leaderboard as competitor, idx}
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
				</Table.Body>
			</Table.Root>
		</div>
		<div>
			<h2 class="h2">Diszipline:</h2>
			<ul>
				{#each challenge.disciplines as d}
					<li>
						{d.name}: {d.factor}
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
