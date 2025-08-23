<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';

	import Button from '$lib/components/ui/button/button.svelte';
	import { getUser } from '$lib/remote/auth.remote';
	import { getActiveChallengeWithLeaderBoard } from '$lib/remote/clubs.remote';
	import { SquareArrowOutUpRight } from 'lucide-svelte';
</script>

{#await getUser()}
	<span>User wird geladen...</span>
{:then user}
	{#if user}
		<div class="flex flex-col gap-8">
			<div>
				<p class="text-lg">Willkommen, {user.name}</p>
				<h1 class="h1">Aktive Challenges:</h1>
			</div>
			{#await getActiveChallengeWithLeaderBoard()}
				<p class="text-center font-mono text-lg font-bold italic">Challenge wird geladen...</p>
			{:then challenges}
				{#each challenges as challenge}
					<div class="rounded-md border border-border p-6">
						<div class="mb-2 flex justify-between gap-4 max-md:flex-col">
							<a
								href="/clubs/{challenge.clubId}/challenge/{challenge.id}"
								class="flex items-center gap-2 hover:text-primary"
							>
								<span class="w-fit text-2xl font-extrabold">
									{challenge.name}
								</span>
								<SquareArrowOutUpRight />
							</a>
							<EntryForm {challenge} disciplines={challenge.disciplines} formData={newEntryForm} />
						</div>
						<Leaderboard currentChallenge={challenge} leaderboard={challenge.leaderboard} />
						<Button
							variant="link"
							class="mt-2"
							href="/clubs/{challenge.clubId}/challenge/{challenge.id}">Komplette Rangliste</Button
						>
					</div>
				{:else}
					<div class="text-center mt-4">
						<h2 class="h2 mb-2">Keine aktiven Challenges</h2>
						<p>
							Du bist momentan in keinen aktiven Challenges. Zeige alle <a
								href="/clubs"
								class="link">Clubs und Challenges</a
							> hier an.
						</p>
					</div>
				{/each}
			{/await}
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
{/await}
