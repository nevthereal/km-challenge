<script lang="ts">
	import { page } from '$app/state';
	import { getChallengeMembers } from '$lib/remote/challenges.remote';

	const clubId = $derived(page.params.clubId ?? '');
	const challengeId = $derived(page.params.challengeId ?? '');
	const membersPage = $derived(getChallengeMembers({ clubId, challengeId }));
</script>

<svelte:boundary>
	{@const data = await membersPage}
	<main>
		<h1 class="h1 mb-4">Mitglieder</h1>
		<ul class="list-inside list-disc">
			{#each data.members as member (member.id)}
				{@const { user } = member}
				{#if user}
					<li>
						<a class="link" href="{data.challengePath}/members/{user.id}">
							{user.name}
							{#if data.admins.some((admin) => admin.userId === user.id)}
								<span>(Admin)</span>
							{/if}
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	</main>

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Mitglieder werden geladen...</p>
	{/snippet}
</svelte:boundary>
