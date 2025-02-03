<script>
	import Leaderboard from '$lib/components/Leaderboard.svelte';
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
				<Leaderboard leaderboard={challenge.leaderboard} />
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
