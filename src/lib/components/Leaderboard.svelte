<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { Leaderboard } from '$lib/db';
	import { prettyDate } from '$lib/utils';

	let { leaderboard }: { leaderboard: Leaderboard } = $props();
</script>

<Table.Root class="mt-8">
	<Table.Header>
		<Table.Row>
			<Table.Head>Rang</Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head>Punktzahl</Table.Head>
			<Table.Head>Geschlecht / Kategorie</Table.Head>
			<Table.Head>Zuletzt aktiv</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each leaderboard as competitor, idx}
			<Table.Row>
				<Table.Cell class="font-medium">{idx + 1}</Table.Cell>
				<Table.Cell class="font-medium">{competitor.username}</Table.Cell>
				<Table.Cell>{competitor.score}</Table.Cell>
				<Table.Cell>{competitor.gender} / {competitor.role}</Table.Cell>
				<Table.Cell>{prettyDate(new Date(competitor.lastActivity))}</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={5} class="text-center">
					<p class="text-lg font-bold text-destructive">Keine Einträge</p>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
