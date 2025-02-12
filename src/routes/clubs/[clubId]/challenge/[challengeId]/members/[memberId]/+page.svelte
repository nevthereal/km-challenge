<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();

	let { member } = $derived(data);
</script>

<div class="mb-4 flex">
	<a
		href={`${data.challengePath}/members`}
		class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Alle Mitglieder</a
	>
</div>
<h1 class="h1">
	<span class="text-primary">
		{member.name}
	</span>
</h1>

<h2 class="h2 my-4">Einträge:</h2>
<div class="flex flex-col gap-4 p-2">
	{#each member.entries as entry}
		<Card.Root>
			<Card.Header>
				<Card.Title
					>{entry.discipline?.name ?? 'Aktivität'} am {Intl.DateTimeFormat('de', {
						dateStyle: 'medium'
					}).format(entry.createdAt)}</Card.Title
				>
			</Card.Header>
			<Card.Content>
				<p>
					{Number(entry.amount) * Number(entry.discipline?.factor ?? 1)} Punkte
					<span class="font-mono text-muted-foreground">({entry.amount}km)</span>
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="italic font-mono font-bold">Noch keine Aktivität</p>
	{/each}
</div>
