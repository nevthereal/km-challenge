<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import Button from '$lib/components/ui/button/button.svelte';
	import { MinusCircle, PlusCircle } from 'lucide-svelte';

	let { data } = $props();

	const { challenge } = data;

	const form = superForm(data.addDisciplineForm, {
		dataType: 'json'
	});

	const { enhance: disciplineEnhance, form: disciplineData } = form;
</script>

<h1 class="h1">Challenge: {challenge.name}</h1>
<div class="mt-6 flex gap-8 p-6 max-md:flex-col-reverse">
	<div class="flex-grow">
		<h2 class="h2">Einträge:</h2>
		<div>
			{#each challenge.entries as entry}
				<Card.Root>
					<Card.Header>
						<Card.Title>asd</Card.Title>
						<Card.Description>Card Description</Card.Description>
					</Card.Header>
					<Card.Content>
						<p>Card Content</p>
					</Card.Content>
					<Card.Footer>
						<p>Card Footer</p>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</div>
	<div>
		<h2 class="h2">Diszipline:</h2>
		<ul>
			{#each challenge.disciplines as d}
				<li>
					{d.name}: {d.factor}
				</li>
			{:else}
				<p class="text-destructive">Keine diszipline</p>
			{/each}
		</ul>

		{#if data.user.superUser}
			<Sheet.Root>
				<Sheet.Trigger class="mt-2">
					<Button variant="link">Diszipline hinzufügen</Button>
				</Sheet.Trigger>
				<Sheet.Content>
					<Sheet.Header>
						<Sheet.Title>Diszipline hinzufügen</Sheet.Title>
						<form method="post" use:disciplineEnhance>
							<Form.Fieldset {form} name="discipline">
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
		{/if}
	</div>
</div>
