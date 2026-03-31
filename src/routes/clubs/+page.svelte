<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { getClubsPage } from '$lib/remote/clubs.remote';
	import { resolve } from '$app/paths';
	import { CirclePlus, PlusCircle } from '@lucide/svelte';

	const clubsPage = getClubsPage();
	const data = await clubsPage;
</script>

<h1 class="h1 mb-8">Deine Clubs</h1>

{#if data.user.superUser}
	<Button size="lg" href={resolve('/clubs/create')} class="my-4"><CirclePlus />Club erstellen</Button>
{/if}

<div class="mb-6 grid gap-6 md:grid-cols-4">
	<Card.Root>
		<a href={resolve('/clubs/join')}>
			<Card.Header>
				<Card.Title class="text-center">Club beitreten</Card.Title>
			</Card.Header>
			<Card.Content class="flex justify-center">
				<PlusCircle size={36} />
			</Card.Content>
		</a>
	</Card.Root>
	{#each data.usersClubs as { club } (club?.id)}
		{#if club}
			<Card.Root>
				<a href={resolve(`/clubs/${club.id}`)}>
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
		{/if}
	{:else}
		<p class="my-auto text-center">
			Du bist momentan in keinem Club. Du kannst aber einem <a
				class="font-medium underline"
				href={resolve('/clubs/join')}>beitreten</a
			>.
		</p>
	{/each}
</div>
