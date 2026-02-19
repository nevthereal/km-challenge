<script lang="ts">
	import { page } from '$app/state';
	import { getChallengeMembersData } from '$lib/remote/challenge.remote';

	const params = $derived(page.params);
	const clubId = $derived(params.clubId ?? '');
	const challengeId = $derived(params.challengeId ?? '');
	const data = $derived(await getChallengeMembersData({ clubId, challengeId }));
	const members = $derived(data.members);
	const challengePath = $derived(data.challengePath);
	const admins = $derived(data.admins);
</script>

<main>
	<h1 class="h1 mb-4">Mitglieder</h1>
	<ul class="list-inside list-disc">
		{#each members as member}
			{@const { user } = member}
			{#if user}
				<li>
					<a class="link" href="{challengePath}/members/{user.id}">
						{user.name}
						{#if admins.some((a) => a.userId === user.id)}
							<span>(Admin)</span>
						{/if}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</main>
