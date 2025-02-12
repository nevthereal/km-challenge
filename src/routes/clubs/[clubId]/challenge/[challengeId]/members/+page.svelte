<script lang="ts">
	let { data } = $props();

	let { members, challengePath, admins } = $derived(data);
</script>

<main>
	<h1 class="h1 mb-4">Mitglieder</h1>
	<ul class="list-inside list-disc">
		{#each members as member}
			{@const { user } = member}
			<li>
				<a class="link" href="{challengePath}/members/{user.id}">
					{user.name}
					{#if admins.some((a) => a.userId === user.id)}
						<span>(Admin)</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</main>
