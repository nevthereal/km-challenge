<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { prettyDate } from '$lib/utils';
	import EntryMetricsChart from '$lib/components/EntryMetricsChart.svelte';
	import { page } from '$app/state';
	import { getChallengeOverviewData } from '$lib/remote/challenge.remote';

	const data = await getChallengeOverviewData({
		clubId: page.params.clubId ?? '',
		challengeId: page.params.challengeId ?? ''
	});

	let { challenge, leaderboard, lastActivities, challengePath, awards } = data;
</script>

<main class="grow">
	<section class="mb-8">
		<div class="mb-4 flex items-center justify-between gap-2 max-md:items-start max-md:portrait:flex-col">
			<h1 class="h1">Rangliste</h1>
			<EntryForm {challenge} disciplines={challenge.disciplines} />
		</div>
		<Leaderboard currentChallenge={challenge} {leaderboard} />
	</section>
	<EntryMetricsChart title="Challenge Gesamtfortschritt (Kilometer, Punkte)" entries={challenge.entries ?? []} />
	<section class="my-8">
		<h2 class="h2 mb-3">Auszeichnungen</h2>
		<div class="flex flex-col gap-3 md:flex-row">
			{#each awards as award}
				<div class="flex-1 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400/50 hover:shadow-md">
					<div class="mb-2 flex items-center justify-between gap-2"><p class="font-semibold text-slate-100">{award.title}</p></div>
					<p class="text-sm text-slate-300">{award.subtitle}</p>
					<p class="mt-3 text-sm"><span class="text-slate-400">Sieger:in:</span> <span class="font-semibold text-amber-200">{award.winner}</span></p>
					<p class="mt-1 text-sm"><span class="text-slate-400">Runner-up:</span> <span class="font-medium text-slate-200">{award.runnerUp}</span></p>
				</div>
			{/each}
		</div>
	</section>
	<section>
		<h2 class="h2 mb-2">Neuste Aktivitäten</h2>
		<ul class="space-y-2">
			{#each lastActivities as activity}
				{@const points = Number(activity.amount) * Number(activity.discipline?.factor)}
				{@const pointString = isNaN(points) ? 'gelöschte Disziplin' : `${points}p`}
				<li class="mx-2">
					<Badge class="mr-2 font-mono">{Intl.DateTimeFormat('de', { dateStyle: 'short', timeStyle: 'short' }).format(activity.createdAt)}</Badge>
					<span class="font-medium"><a class="underline" href="{challengePath}/members/{activity.userId}">{activity.user?.name ?? 'Unbekannter/Gelöschter Benutzer'}</a></span>
					{activity.amount}km ({pointString}) in {activity.discipline ? activity.discipline.name : 'gelöschte Disziplin'} am {prettyDate(activity.date)}
				</li>
			{:else}
				<p>Noch keine Aktivitäten</p>
			{/each}
		</ul>
	</section>
</main>
