<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	let { data } = $props();

	let { challenge, leaderboard, lastActivities, challengePath } = $derived(data);
</script>

<main class="flex-grow">
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
				<li class="mx-2">
					<Badge class="mr-2 font-mono"
						>{Intl.DateTimeFormat('de', { dateStyle: 'short', timeStyle: 'short' }).format(
							activity.createdAt
						)}</Badge
					>
					<span class="font-medium"
						><a class="underline" href="{challengePath}/members/{activity.userId}"
							>{activity.user.name}</a
						></span
					>
					<span class="text-muted-foreground">hat</span>
					<span class="font-medium">{activity.amount}km</span>
					<span class="text-muted-foreground">in</span>
					<span class="font-medium"
						>{activity.discipline ? activity.discipline.name : 'gelöschte Aktivität'}</span
					>
					<span class="text-muted-foreground">eingetragen</span>
				</li>
			{:else}
				<p>Noch keine Aktivitäten</p>
			{/each}
		</ul>
	</section>
</main>
