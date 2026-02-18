<script lang="ts">
	import { page } from '$app/state';
	import { getChallengeMembersData } from '$lib/remote/challenge.remote';

	const data = await getChallengeMembersData({
		clubId: page.params.clubId ?? '',
		challengeId: page.params.challengeId ?? ''
	});

	let { members, challengePath, admins } = data;
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
