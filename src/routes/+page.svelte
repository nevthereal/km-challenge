<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';

	let { data } = $props();
</script>

{#if data.user}
	<div class="flex flex-col gap-8">
		{#each data.challengesWithLeaderboards as challenge}
			{#await challenge then challenge}
				<div class="rounded-md border border-border p-6">
					<h2 class="h2">{challenge.name}</h2>
					<EntryForm disciplines={challenge.disciplines} formData={data.newEntryForm} />
					<Leaderboard leaderboard={challenge.leaderboard} />
				</div>
			{/await}
		{/each}
	</div>
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
