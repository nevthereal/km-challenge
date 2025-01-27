<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { PlusCircle } from 'lucide-svelte';

	let { data } = $props();

	const { usersClubs } = data;
</script>

<h1 class="h1">Deine Clubs</h1>

{#if data.superUser}
	<Button size="lg" href="/clubs/create" class="mb-2">Club erstellen</Button>
{/if}
<div class="mb-6 grid gap-6 md:grid-cols-3">
	<Card.Root>
		<a href="/clubs/join">
			<Card.Header>
				<Card.Title class="text-center">Club beitreten</Card.Title>
			</Card.Header>
			<Card.Content class="flex justify-center">
				<PlusCircle size={36} />
			</Card.Content>
		</a>
	</Card.Root>
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
