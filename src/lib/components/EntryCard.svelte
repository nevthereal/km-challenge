<script lang="ts">
	import { entry as dbEntry, discipline as dbDiscipline } from '$lib/db/schema';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		entry: typeof dbEntry.$inferSelect;
		discipline: typeof dbDiscipline.$inferSelect | null;
	}

	let { entry, discipline }: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title
			>{discipline?.name ?? 'Aktivität'} am {Intl.DateTimeFormat('de', {
				dateStyle: 'medium'
			}).format(entry.createdAt)}</Card.Title
		>
	</Card.Header>
	<Card.Content class="flex items-center justify-between">
		<p>
			{Number(entry.amount) * Number(discipline?.factor ?? 1)} Punkte
			<span class="font-mono text-muted-foreground">({entry.amount}km)</span>
		</p>
	</Card.Content>
</Card.Root>
