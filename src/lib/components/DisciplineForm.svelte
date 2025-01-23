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

	const { enhance: disciplineEnhance, form: disciplineData } = disciplineForm;
</script>

<Sheet.Root>
	<Sheet.Trigger class="mt-2">
		<Button variant="outline">Diszipline hinzufügen</Button>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Diszipline hinzufügen</Sheet.Title>
			<form method="post" action="?/addDiscipline" use:disciplineEnhance>
				<Form.Fieldset form={disciplineForm} name="discipline">
					{#each $disciplineData.discipline as _, i}
						<div class="flex">
							<div class="flex gap-4">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex flex-col gap-2">
											<Form.Label>Name</Form.Label>
											<Input
												type="text"
												{...props}
												bind:value={$disciplineData.discipline[i].name}
											/>
										</div>
									{/snippet}
								</Form.Control>

								<Form.Control>
									{#snippet children({ props })}
										<div class="flex flex-col gap-2">
											<Form.Label>Multiplikator</Form.Label>
											<Input
												type="number"
												step="0.1"
												{...props}
												bind:value={$disciplineData.discipline[i].multiplier}
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
									$disciplineData.discipline = $disciplineData.discipline.filter(
										(_, index) => index !== i
									);
								}}><MinusCircle /></Button
							>
						</div>
					{/each}
					<Button
						type="button"
						variant="outline"
						onclick={() =>
							($disciplineData.discipline = [
								...$disciplineData.discipline,
								{ multiplier: 1, name: '' }
							])}><PlusCircle /> Eine mehr</Button
					>
				</Form.Fieldset>
				<Form.Button class="mt-4" type="submit">Speichern</Form.Button>
			</form>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
