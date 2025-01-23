<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { PlusCircle } from 'lucide-svelte';

	let { data } = $props();

	const { usersClubs } = data;
</script>

<h1 class="h1">Deine Clubs</h1>

<div class="mb-6 grid gap-6 md:grid-cols-3">
	{#if data.superUser}
		<Card.Root>
			<a href="/clubs/create">
				<Card.Header>
					<Card.Title class="text-center">Club erstellen</Card.Title>
				</Card.Header>
				<Card.Content class="flex justify-center">
					<PlusCircle size={36} />
				</Card.Content>
			</a>
		</Card.Root>
	{/if}
	{#each usersClubs as { club }}
		<Card.Root>
			<a href={`/clubs/${club.id}`}>
				<Card.Header>
					<Card.Title>
						{club.name}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p>{club.challenges.length || 'Keine'} Challenges</p>
					<p>{club.members.length || 'Keine'} Mitglieder</p>
				</Card.Content>
			</a>
		</Card.Root>
	{:else}
		<p>
			Du bist momentan in keinem Club. Du kannst aber einem <a class="a" href="/clubs/join"
				>beitreten.</a
			>
		</p>
	{/each}
</div>
