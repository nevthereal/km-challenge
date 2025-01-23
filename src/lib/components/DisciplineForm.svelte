<script lang="ts">
	import { Button } from './ui/button';
	import { Input } from './ui/input';
	import * as Sheet from './ui/sheet';
	import * as Form from './ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { addDisciplines } from '$lib/zod';
	import { MinusCircle, PlusCircle } from 'lucide-svelte';

	let { formData }: { formData: SuperValidated<Infer<typeof addDisciplines>> } = $props();

	const disciplineForm = superForm(formData, {
		dataType: 'json'
	});

	const { enhance, form, constraints } = disciplineForm;
</script>

<Sheet.Root>
	<Sheet.Trigger class="mt-2">
		<Button variant="outline">Diszipline hinzufügen</Button>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Diszipline hinzufügen</Sheet.Title>
			<form method="post" action="?/addDiscipline" use:enhance>
				<Form.Fieldset form={disciplineForm} name="discipline">
					{#each $form.discipline as _, i}
						<div class="flex">
							<div class="flex gap-4">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex flex-col gap-2">
											<Form.Label>Name</Form.Label>
											<Input
												{...$constraints.discipline?.name}
												type="text"
												{...props}
												bind:value={$form.discipline[i].name}
											/>
										</div>
									{/snippet}
								</Form.Control>

								<Form.Control>
									{#snippet children({ props })}
										<div class="flex flex-col gap-2">
											<Form.Label>Multiplikator</Form.Label>
											<Input
												{...$constraints.discipline?.multiplier}
												type="number"
												{...props}
												bind:value={$form.discipline[i].multiplier}
											/>
										</div>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</div>
							<Button
								type="button"
								variant="destructive"
								class="mt-auto"
								onclick={() => {
									$form.discipline = $form.discipline.filter((_, index) => index !== i);
								}}><MinusCircle /></Button
							>
						</div>
					{/each}
					<Button
						type="button"
						variant="outline"
						onclick={() => ($form.discipline = [...$form.discipline, { multiplier: 1, name: '' }])}
						><PlusCircle /> Eine mehr</Button
					>
				</Form.Fieldset>
				<Form.Button class="mt-4" type="submit">Speichern</Form.Button>
			</form>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
