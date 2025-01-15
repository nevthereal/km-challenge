<script lang="ts">
	let { data } = $props();

	let { challenges } = data;
</script>

<a href="/challenges/create">Challenge erstellen</a>

{#each challenges as challenge}
	<a class="text-red-500" href={`/challenges/${challenge.id}`}>{challenge.name}</a>
{/each}
