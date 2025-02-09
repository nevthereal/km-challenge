<script lang="ts">
	import { prettyDate } from '$lib/utils';

	let { data } = $props();

	let { members } = $derived(data);
</script>

<main>
	<h1 class="h1 mb-4">Mitglieder</h1>
	<ul class="list-inside list-disc">
		{#each members as member}
			{@const { user } = member}
			<li>
				{user.name},
				<span class="text-muted-foreground">
					{prettyDate(member.joinedAt!)}
				</span>
			</li>
		{/each}
	</ul>
</main>
