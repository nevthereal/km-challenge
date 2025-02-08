<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { SquareArrowOutUpRight } from 'lucide-svelte';

	let { data } = $props();
</script>

{#if data.user}
	<div class="flex flex-col gap-8">
		<h1 class="h1">Aktive Challenges:</h1>
		{#each data.challengesWithLeaderboards as challenge}
			<div class="rounded-md border border-border p-6">
				<div class="flex justify-between gap-4">
					<a
						href={`/clubs/${challenge.clubId}/challenge/${challenge.id}`}
						class="flex items-center gap-2 hover:text-primary"
					>
						<span class="w-fit text-2xl font-extrabold">
							{challenge.name}
						</span>
						<SquareArrowOutUpRight />
					</a>
					<EntryForm {challenge} disciplines={challenge.disciplines} formData={data.newEntryForm} />
				</div>
				<Leaderboard leaderboard={challenge.leaderboard} />
			</div>
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
