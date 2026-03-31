<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { getLeaderboard } from '$lib/remote/challenges.remote';
	import type { challenge } from '$lib/db/schema';
	import { cn } from '$lib/utils';
	import { Skeleton } from './ui/skeleton';

	let {
		currentChallenge,
		limit
	}: {
		currentChallenge: typeof challenge.$inferSelect & {
			clubId: string;
			id: string;
		};
		limit: number;
	} = $props();

	const leaderboard = $derived(getLeaderboard({ challengeId: currentChallenge.id, limit }));
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
	<svelte:boundary>
		<Table.Body>
			{@const rows = await leaderboard}
			{#each rows as competitor, idx (competitor.id)}
				<Table.Row
					class={cn(
						idx === 0 ? 'text-gold' : idx === 1 ? 'text-silver' : idx === 2 ? 'text-bronze' : ''
					)}
				>
					<Table.Cell>
						{idx + 1}
					</Table.Cell>
					<Table.Cell class="font-medium"
						><a
							class="flex items-center gap-1 font-bold hover:underline"
							href="/clubs/{currentChallenge.clubId}/challenge/{currentChallenge.id}/members/{competitor.id}"
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
					<Table.Cell colspan={6} class="text-center">
						<p class="text-lg font-bold text-destructive">Noch keine Einträge</p>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>

		{#snippet pending()}
			<Table.Body>
				{#each Array.from({ length: 4 }) as _, rowIndex (rowIndex)}
					<Table.Row>
						{#each Array.from({ length: 6 }) as _, cellIndex (cellIndex)}
							<Table.Cell class="text-center"><Skeleton class="h-4 w-full" /></Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		{/snippet}
	</svelte:boundary>
</Table.Root>
<p class="text-destructive my-4 hidden text-center font-mono italic max-md:portrait:block">
	Bildschirm drehen um Tabelle anzuzeigen
</p>
