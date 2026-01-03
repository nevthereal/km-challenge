<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { canAddEntries, prettyDate } from '$lib/utils';

	let { data } = $props();

	let { challenge, leaderboard, lastActivities, challengePath } = $derived(data);

	const canStillAddEntries = $derived(canAddEntries(challenge));
</script>

<main class="grow">
	<section class="mb-8">
		<div
			class="mb-4 flex items-center justify-between gap-2 max-md:items-start max-md:portrait:flex-col"
		>
			<h1 class="h1">Rangliste</h1>
			<EntryForm {challenge} disciplines={challenge.disciplines} formData={data.newEntryForm} />
		</div>
		<Leaderboard currentChallenge={challenge} {leaderboard} />
	</section>
	<section>
		<h2 class="h2 mb-2">Neuste Aktivitäten</h2>
		<ul class="space-y-2">
			{#each lastActivities as activity}
				{@const points = Number(activity.amount) * Number(activity.discipline?.factor)}
				{@const pointString = isNaN(points) ? 'gelöschte Disziplin' : `${points}p`}
				<li class="mx-2">
					<Badge class="mr-2 font-mono"
						>{Intl.DateTimeFormat('de', { dateStyle: 'short', timeStyle: 'short' }).format(
							activity.createdAt
						)}</Badge
					>
					<span class="font-medium"
						><a class="underline" href="{challengePath}/members/{activity.userId}"
							>{activity.user?.name ?? 'Unbekannter/Gelöschter Benutzer'}</a
						></span
					>
					{activity.amount}km ({pointString}) in {activity.discipline
						? activity.discipline.name
						: 'gelöschte Disziplin'} am {prettyDate(activity.date)}
				</li>
			{:else}
				<p>Noch keine Aktivitäten</p>
			{/each}
		</ul>
	</section>
</main>
