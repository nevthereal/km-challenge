<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { Leaderboard } from '$lib/db';
	import { prettyDate } from '$lib/utils';
	import { Skeleton } from './ui/skeleton';

	let { leaderboard }: { leaderboard: Leaderboard } = $props();
</script>

<Table.Root>
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
		{#await leaderboard}
			{#each { length: 4 }}
				<Table.Row>
					{#each { length: 5 }}
						<Table.Cell class="text-center"><Skeleton class="h-4 w-full" /></Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		{:then leaderboard}
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
						<p class="text-lg font-bold text-destructive">No entries yet</p>
					</Table.Cell>
				</Table.Row>
			{/each}
		{/await}
	</Table.Body>
</Table.Root>
