<script lang="ts">
	import { prettyDate } from '$lib/utils';

	let { data } = $props();

	let { members } = $derived(data);
</script>

<main>
	<h1 class="h1 mb-4">Mitglieder</h1>
	<p>Work in progress, kommt noch mehr</p>
	<ul class="list-inside list-disc">
		{#each members as member}
			{@const { user } = member}
			<li>
				{user.name}
			</li>
		{/each}
	</ul>
</main>
