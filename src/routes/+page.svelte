<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { getHomeDashboard } from '$lib/remote/challenges.remote';

	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { resolve } from '$app/paths';

	import { SquareArrowOutUpRight } from '@lucide/svelte';
	import { prettyDate } from '$lib/utils';

	const homeDashboard = getHomeDashboard();
	const data = await homeDashboard;
</script>

{#if data.user}
	<div class="flex flex-col gap-8">
		<div>
			<p class="text-lg">Willkommen, {data.user.name}</p>
			<h1 class="h1">Aktive Challenges:</h1>
		</div>
		{#each data.activeChallenges as currentChallenge (currentChallenge.id)}
			<div class="border-border rounded-md border p-6">
				<div class="mb-2 flex justify-between gap-4 max-md:flex-col">
					<a
						href={resolve(`/clubs/${currentChallenge.clubId}/challenge/${currentChallenge.id}`)}
						class="hover:text-primary flex items-center gap-2"
					>
						<span class="w-fit text-2xl font-extrabold">
							{currentChallenge.name}
						</span>
						<SquareArrowOutUpRight />
					</a>
					<EntryForm challenge={currentChallenge} disciplines={currentChallenge.disciplines} />
				</div>
				<Leaderboard currentChallenge={currentChallenge} limit={5} />
				<Button
					variant="link"
					class="mt-2"
					href={resolve(`/clubs/${currentChallenge.clubId}/challenge/${currentChallenge.id}`)}
					>Komplette Rangliste</Button
				>
			</div>
		{:else}
			<div class="mt-4 text-center">
				<h2 class="h2 mb-2">Keine aktiven Challenges</h2>
				<p>
					Du bist momentan in keinen aktiven Challenges. Zeige alle <a
						href={resolve('/clubs')}
						class="link">Clubs und Challenges</a
					> hier an.
				</p>
			</div>
		{/each}

		{#if data.openForEntriesChallenges.length > 0}
			<div>
				<h2 class="mb-4 text-2xl font-bold">Offen für Einträge</h2>
				<div class="grid gap-4 md:grid-cols-3">
					{#each data.openForEntriesChallenges as openChallenge (openChallenge.id)}
						<a href={resolve(`/clubs/${openChallenge.clubId}/challenge/${openChallenge.id}`)}>
							<Card.Root>
								<Card.Header>
									<Card.Title>{openChallenge.name}</Card.Title>
									<Card.Description
										>{prettyDate(new Date(openChallenge.startsAt))} - {prettyDate(
											new Date(openChallenge.endsAt)
										)}</Card.Description
									>
								</Card.Header>
								<Card.Footer>
									<p class="mt-4 text-red-500">
										{openChallenge.daysRemaining}
										{openChallenge.daysRemaining === 1 ? 'Tag' : 'Tage'} noch
									</p>
								</Card.Footer>
							</Card.Root>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<section>
		<h1 class="mb-4 text-5xl font-extrabold">Willkommen!</h1>
		<p>Auf der Kilometer-Challenge Website</p>
		<h2 class="mt-4 font-medium">Wichtige Links:</h2>
		<ul class="mt-2 list-inside list-disc">
			<li><a class="link" href={resolve('/signin')}>Einloggen</a></li>
			<li><a class="link" href={resolve('/clubs')}>Clubs</a></li>
		</ul>
	</section>
{/if}
