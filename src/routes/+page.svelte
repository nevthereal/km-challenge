<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { SquareArrowOutUpRight } from 'lucide-svelte';

	let { data } = $props();
</script>

{#if data.user}
	<div class="flex flex-col gap-8">
		<div>
			<p class="text-lg">Willkommen, {data.user.name}</p>
			<h1 class="h1">Aktive Challenges:</h1>
		</div>
		{#each data.challengesWithLeaderboards as challenge}
			{#await challenge}
				<p class="text-center font-mono text-lg font-bold italic">Challenge wird geladen...</p>
			{:then resolvedChallenge}
				<div class="rounded-md border border-border p-6">
					<div class="mb-2 flex justify-between gap-4 max-md:flex-col">
						<a
							href={`/clubs/${resolvedChallenge.clubId}/challenge/${resolvedChallenge.id}`}
							class="flex items-center gap-2 hover:text-primary"
						>
							<span class="w-fit text-2xl font-extrabold">
								{resolvedChallenge.name}
							</span>
							<SquareArrowOutUpRight />
						</a>
						<EntryForm
							challenge={resolvedChallenge}
							disciplines={resolvedChallenge.disciplines}
							formData={data.newEntryForm}
						/>
					</div>
					<Leaderboard
						currentChallenge={resolvedChallenge}
						leaderboard={resolvedChallenge.leaderboard}
					/>
				</div>
			{/await}
		{:else}
			<div class="text-center mt-4">
				<h2 class="h2 mb-2">Keine aktiven Challenges</h2>
				<p>
					Du bist momentan in keinen aktiven Challenges. Zeige alle <a href="/clubs" class="link"
						>Clubs und Challenges</a
					> hier an.
				</p>
			</div>
		{/each}
	</div>
{:else}
	<section>
		<h1 class="mb-4 text-5xl font-extrabold">Willkommen!</h1>
		<p>Auf der Kilometer-Challenge Website</p>
		<h2 class="mt-4 font-medium">Wichtige Links:</h2>
		<ul class="mt-2 list-inside list-disc">
			<li><a class="link" href="/signin">Einloggen</a></li>
			<li><a class="link" href="/clubs">Clubs</a></li>
		</ul>
	</section>
{/if}
