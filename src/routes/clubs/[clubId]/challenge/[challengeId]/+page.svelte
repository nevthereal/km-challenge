<script>
	import EntryForm from '$lib/components/EntryForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';

	let { data } = $props();

	let { challenge, leaderboard } = $derived(data);
</script>

<main class="flex-grow">
	<div
		class="mb-4 flex items-center justify-between gap-2 max-md:items-start max-md:portrait:flex-col"
	>
		<h1 class="h1">Rangliste</h1>
		<EntryForm {challenge} disciplines={challenge.disciplines} formData={data.newEntryForm} />
	</div>
	<Leaderboard currentChallenge={challenge} {leaderboard} />
</main>
