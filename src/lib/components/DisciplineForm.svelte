<script lang="ts">
	import { MinusCircle, PlusCircle } from '@lucide/svelte';
	import { addDisciplines } from '$lib/remote/challenge.remote';
	import { Button } from './ui/button';
	import * as Field from './ui/field';
	import { Input } from './ui/input';
	import * as Sheet from './ui/sheet';

	let { challengeId }: { challengeId: string } = $props();

	let sheetOpen = $state(false);
	let rows = $state([{ name: '', multiplier: 1 }]);

	const disciplineForm = addDisciplines.for(challengeId);

	$effect(() => {
		disciplineForm.fields.challengeId.set(challengeId);
	});
</script>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Trigger class="mt-2">
		<Button variant="outline">Diszipline hinzufügen</Button>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Diszipline hinzufügen</Sheet.Title>
			<form
				{...disciplineForm.enhance(async ({ submit }) => {
					await submit();
					sheetOpen = false;
					rows = [{ name: '', multiplier: 1 }];
				})}
			>
				<input hidden {...disciplineForm.fields.challengeId.as('text')} />
				{#each rows as row, i}
					<div class="mb-3 flex gap-4">
						<Field.Field class="flex-1">
							<Field.FieldLabel for={`discipline-name-${i}`}>Name</Field.FieldLabel>
							<Input id={`discipline-name-${i}`} name={`discipline[${i}].name`} bind:value={row.name} />
						</Field.Field>
						<Field.Field class="w-40">
							<Field.FieldLabel for={`discipline-multiplier-${i}`}>Multiplikator</Field.FieldLabel>
							<Input
								id={`discipline-multiplier-${i}`}
								type="number"
								step="0.1"
								name={`discipline[${i}].multiplier`}
								bind:value={row.multiplier}
							/>
						</Field.Field>
						<Button
							type="button"
							variant="destructive"
							class="mt-auto"
							onclick={() => {
								rows = rows.filter((_, index) => index !== i);
							}}><MinusCircle /></Button
						>
					</div>
				{/each}
				<Field.FieldError issues={disciplineForm.fields.allIssues()} />
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						rows = [...rows, { multiplier: 1, name: '' }];
					}}><PlusCircle /> Eine mehr</Button
				>
				<Button class="mt-4" type="submit">Speichern</Button>
			</form>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
