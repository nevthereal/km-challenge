<script lang="ts">
	import { MinusCircle, PlusCircle } from '@lucide/svelte';
	import { addDisciplinesForm } from '$lib/remote/challenges.remote';
	import { Button } from './ui/button';
	import * as Field from './ui/field';
	import { Input } from './ui/input';
	import * as Sheet from './ui/sheet';

	let { challengeId, clubId }: { challengeId: string; clubId: string } = $props();

	let sheetOpen = $state(false);
	let primedChallengeId = $state<string | null>(null);

	const disciplineForm = $derived(addDisciplinesForm.for(challengeId));

	function resetDefaults() {
		disciplineForm.fields.set({
			discipline: [
				{
					name: '',
					multiplier: 1
				}
			]
		});
	}

	$effect(() => {
		if (primedChallengeId !== challengeId) {
			resetDefaults();
			primedChallengeId = challengeId;
		}
	});

	const disciplines = $derived(disciplineForm.fields.discipline.value() ?? []);

	async function onsubmit({ form, submit }: { form: HTMLFormElement; submit: any }) {
		await submit();

		if ((disciplineForm.fields.allIssues()?.length ?? 0) === 0) {
			sheetOpen = false;
			form.reset();
			resetDefaults();
		}
	}
</script>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Trigger class="mt-2">
		<Button variant="outline">Diszipline hinzufügen</Button>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Diszipline hinzufügen</Sheet.Title>
		</Sheet.Header>

		<form {...disciplineForm.enhance(onsubmit)} class="mt-6 space-y-4">
			{#each disciplines as _, i (i)}
				<div class="flex items-end gap-4">
					<div class="grid flex-1 gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.Label for="discipline-name-{challengeId}-{i}">Name</Field.Label>
							<Input
								id="discipline-name-{challengeId}-{i}"
								{...disciplineForm.fields.discipline[i].name.as('text')}
							/>
							{#each disciplineForm.fields.discipline[i].name.issues() as issue, index (`discipline-name-${challengeId}-${i}-${index}-${issue.message}`)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>

						<Field.Field>
							<Field.Label for="discipline-multiplier-{challengeId}-{i}">Multiplikator</Field.Label>
							<Input
								id="discipline-multiplier-{challengeId}-{i}"
								step="0.1"
								{...disciplineForm.fields.discipline[i].multiplier.as('number')}
							/>
							{#each disciplineForm.fields.discipline[i].multiplier.issues() as issue, index (`discipline-multiplier-${challengeId}-${i}-${index}-${issue.message}`)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
					</div>

					<Button
						type="button"
						variant="destructive"
						onclick={() => {
							disciplineForm.fields.discipline.set(
								disciplines.filter((_, index) => index !== i)
							);
						}}
					>
						<MinusCircle />
					</Button>
				</div>
			{/each}

			<div class="flex gap-3">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						disciplineForm.fields.discipline.set([
							...disciplines,
							{ multiplier: 1, name: '' }
						]);
					}}
				>
					<PlusCircle /> Eine mehr
				</Button>
				<Button type="submit">Speichern</Button>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
