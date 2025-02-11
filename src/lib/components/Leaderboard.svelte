<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { Leaderboard } from '$lib/db';
	import type { challenge } from '$lib/db/schema';
	import { Skeleton } from './ui/skeleton';

	let {
		leaderboard,
		currentChallenge
	}: { leaderboard: Leaderboard; currentChallenge: typeof challenge.$inferSelect } = $props();
</script>

<Table.Root class="max-md:portrait:hidden">
	<Table.Header>
		<Table.Row>
			<Table.Head>Rang</Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head>Punktzahl</Table.Head>
			<Table.Head>Ges.</Table.Head>
			<Table.Head>Kat.</Table.Head>
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
					<Table.Cell>{idx + 1}</Table.Cell>
					<Table.Cell class="font-medium"
						><a
							href={`/clubs/${currentChallenge.clubId}/challenge/${currentChallenge.id}/members/${competitor.id}`}
							>{competitor.name}</a
						></Table.Cell
					>
					<Table.Cell>{competitor.score}</Table.Cell>
					<Table.Cell>{competitor.gender}</Table.Cell>
					<Table.Cell>{competitor.role}</Table.Cell>
					<Table.Cell
						>{Intl.DateTimeFormat('de', { dateStyle: 'medium' }).format(
							new Date(competitor.lastActivity)
						)}</Table.Cell
					>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="text-center">
						<p class="text-lg font-bold text-destructive">Noch keine Einträge</p>
					</Table.Cell>
				</Table.Row>
			{/each}
		{/await}
	</Table.Body>
</Table.Root>
<p class="my-4 hidden text-center font-mono italic text-destructive max-md:portrait:block">
	Bildschirm drehen um Tabelle anzuzeigen
</p>
