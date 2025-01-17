<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { PlusCircle } from 'lucide-svelte';

	let { data } = $props();

	const { usersClubs } = data;
</script>

<h1 class="h1 mb-4">Deine Clubs</h1>

<div class="mb-6 grid grid-cols-3 gap-6">
	{#if data.superUser}
		<a href="/clubs/create">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-center">Club erstellen</Card.Title>
				</Card.Header>
				<Card.Content class="flex justify-center">
					<PlusCircle size={36} />
				</Card.Content>
			</Card.Root>
		</a>
	{/if}
</div>

{#each usersClubs as { club }}
	{club.name}
{:else}
	<p>
		Du bist momentan in keinem Club. Du kannst aber einem <a class="a" href="/clubs/join"
			>beitreten.</a
		>
	</p>
{/each}
