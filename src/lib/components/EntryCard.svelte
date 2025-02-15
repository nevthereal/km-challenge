<script lang="ts">
	import { entry as dbEntry, discipline as dbDiscipline } from '$lib/db/schema';
	import * as Card from '$lib/components/ui/card';
	import Button from './ui/button/button.svelte';
	import { Pencil, Trash2 } from 'lucide-svelte';

	interface Props {
		entry: typeof dbEntry.$inferSelect;
		discipline: typeof dbDiscipline.$inferSelect | null;
		edit: boolean;
	}
	let { entry, discipline, edit }: Props = $props();
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
		{#if edit}
			<div class="flex gap-2">
				<Button variant="ghost" size="icon" class="text-primary"><Pencil /></Button>
				<Button variant="ghost" size="icon" class="text-destructive"><Trash2 /></Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
