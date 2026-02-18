<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { SquareArrowOutUpRight } from '@lucide/svelte';
	import { canAddEntries, prettyDate } from '$lib/utils';
	import {
		getHomeActiveChallengesData,
		getHomeOpenEntriesData,
		getHomeViewerData
	} from '$lib/remote/challenge.remote';

	const homeViewerQuery = getHomeViewerData();
	const { user } = await homeViewerQuery;
	const homeActiveChallengesQuery = user ? getHomeActiveChallengesData() : null;
	const homeOpenEntriesQuery = user ? getHomeOpenEntriesData() : null;

	const challengesWithLeaderboards = $derived(
		homeActiveChallengesQuery?.current ?? []
	);
	const openForEntriesChallenges = $derived(
		(homeOpenEntriesQuery?.current ?? []).filter((c) => canAddEntries(c))
	);
</script>

{#if user}
	<div class="flex flex-col gap-8">
		<div>
			<p class="text-lg">Willkommen, {user.name}</p>
			<h1 class="h1">Aktive Challenges:</h1>
		</div>
		{#each challengesWithLeaderboards as resolvedChallenge}
			<div class="border-border rounded-md border p-6">
				<div class="mb-2 flex justify-between gap-4 max-md:flex-col">
					<a
						href="/clubs/{resolvedChallenge.clubId}/challenge/{resolvedChallenge.id}"
						class="hover:text-primary flex items-center gap-2"
					>
						<span class="w-fit text-2xl font-extrabold">{resolvedChallenge.name}</span>
						<SquareArrowOutUpRight />
					</a>
					<EntryForm
						challenge={resolvedChallenge}
						disciplines={resolvedChallenge.disciplines}
						updateQueries={[homeViewerQuery, homeActiveChallengesQuery, homeOpenEntriesQuery].filter(
							Boolean
						)}
					/>
				</div>
				<Leaderboard currentChallenge={resolvedChallenge} leaderboard={resolvedChallenge.leaderboard} />
				<Button
					variant="link"
					class="mt-2"
					href="/clubs/{resolvedChallenge.clubId}/challenge/{resolvedChallenge.id}"
					>Komplette Rangliste</Button
				>
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

		{#if openForEntriesChallenges.length > 0}
			<div>
				<h2 class="mb-4 text-2xl font-bold">Offen für Einträge</h2>
				<div class="grid gap-4 md:grid-cols-3">
					{#each openForEntriesChallenges as openChallenge}
						<a href="/clubs/{openChallenge.clubId}/challenge/{openChallenge.id}">
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
			<li><a class="link" href="/signin">Einloggen</a></li>
			<li><a class="link" href="/clubs">Clubs</a></li>
		</ul>
	</section>
{/if}
