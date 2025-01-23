<script lang="ts">
	import { PlusCircle } from 'lucide-svelte';
	import { Button, buttonVariants } from './ui/button';
	import * as Dialog from './ui/dialog';
	import * as Form from './ui/form';
	import * as Select from './ui/select';
	import { Input } from './ui/input';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { newEntry } from '$lib/zod';
	import type { discipline } from '$lib/db/schema';

	let {
		formData,
		disciplines
	}: {
		formData: SuperValidated<Infer<typeof newEntry>>;
		disciplines: (typeof discipline.$inferSelect)[];
	} = $props();

	const entryForm = superForm(formData);

	const { enhance: entryEnhance, form: entryData } = entryForm;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
		><PlusCircle /> Neuer Eintrag</Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="h2">Neuer Eintrag</Dialog.Title>
			<form use:entryEnhance action="?/newEntry" method="post">
				<div class="flex gap-4">
					<Form.Field form={entryForm} name="amount">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Kilometer</Form.Label>
								<Input {...props} step="0.01" type="number" bind:value={$entryData.amount} />
							{/snippet}
						</Form.Control>
						<Form.Description />
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={entryForm} name="disciplineId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Disziplin</Form.Label>
								<Select.Root type="single" bind:value={$entryData.disciplineId} name={props.name}>
									<Select.Trigger {...props}>
										{$entryData.disciplineId
											? disciplines.find((d) => d.id === $entryData.disciplineId)?.name
											: 'Disziplin Wählen'}
									</Select.Trigger>
									<Select.Content>
										{#each disciplines as discipline}
											<Select.Item value={discipline.id} label={discipline.name} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<Button class="mt-auto">Hinzufügen</Button>
			</form>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
