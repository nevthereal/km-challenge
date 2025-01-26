<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { prettyDate } from '$lib/utils.js';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();

	const { challenge } = $derived(data);
	const { currentUserChallenge } = data;
</script>

<h1 class="h1">Challenge: {challenge.name}</h1>
{#if currentUserChallenge}
	<div class="mt-6 flex gap-8 p-6 max-md:flex-col-reverse">
		<div class="flex-grow">
			<h2 class="h2">Einträge:</h2>
			<EntryForm disciplines={challenge.disciplines} formData={data.newEntryForm} />
			<div>
				{#each challenge.entries as entry}
					<Card.Root>
						<Card.Header>
							<Card.Title>{entry.user.name} am {prettyDate(entry.date)}</Card.Title>
						</Card.Header>
						<Card.Content>
							<p>
								<span class="font-bold">
									{Number(entry.amount) * Number(entry.discipline.factor)} Punkte
								</span>
								<span class="text-muted-foreground">
									({entry.discipline.name},
									{entry.amount}km)
								</span>
							</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
		<div>
			<h2 class="h2">Diszipline:</h2>
			<ul>
				{#each challenge.disciplines as d}
					<li>
						{d.name}: {d.factor}
					</li>
				{:else}
					<p class="text-destructive">Keine diszipline</p>
				{/each}
			</ul>

			{#if data.user.superUser}
				<DisciplineForm formData={data.addDisciplineForm} />
			{/if}
		</div>
	</div>
{:else}
	<div>
		<form action="?/join" use:enhance method="post">
			<Button type="submit">Challenge beitreten</Button>
		</form>
	</div>
{/if}
