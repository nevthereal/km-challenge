<script>
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth/client';
	import { LogIn } from 'lucide-svelte';
	import * as Table from '$lib/components/ui/table';
	import { prettyDate } from '$lib/utils';

	let { data } = $props();

	let { challengesWithLeaderboards: challenges } = data;
</script>

{#if challenges}
	{#each challenges as challenge}
		{#await challenge then challenge}
			<div>
				<h2 class="h2">{challenge.name}</h2>
				{#each challenge.leaderboard as competitor, idx}
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
			</div>
		{/await}
	{/each}
{:else}
	<section>
		<h1 class="mb-4 text-5xl font-extrabold">Willkommen!</h1>
		<p>Auf der Kilometer-Challenge Website</p>
		<h2 class="mt-4 font-medium">Wichtige Links:</h2>
		<ul class="mt-2 list-inside list-disc">
			<li><a class="font-medium underline" href="/signin">Einloggen</a></li>
			<li><a class="font-medium underline" href="/clubs">Clubs</a></li>
		</ul>
	</section>
{/if}
