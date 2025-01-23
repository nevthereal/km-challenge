<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { MinusCircle, PlusCircle } from 'lucide-svelte';
	import { prettyDate } from '$lib/utils.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import DisciplineForm from '$lib/components/DisciplineForm.svelte';
	import EntryForm from '$lib/components/EntryForm.svelte';

	let { data } = $props();

	const { challenge } = $derived(data);
</script>

<h1 class="h1">Challenge: {challenge.name}</h1>
<div class="mt-6 flex gap-8 p-6 max-md:flex-col-reverse">
	<div class="flex-grow">
		<h2 class="h2">Einträge:</h2>
		<EntryForm disciplines={challenge.disciplines} formData={data.newEntryForm} />
		<div>
			{#each challenge.entries as entry}
				<Card.Root>
					<Card.Header>
						<Card.Title>{entry.user.name} - {prettyDate(entry.createdAt)}</Card.Title>
						<Card.Description>Card Description</Card.Description>
					</Card.Header>
					<Card.Content>
						<p>Card Content</p>
					</Card.Content>
					<Card.Footer>
						<p>Card Footer</p>
					</Card.Footer>
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
