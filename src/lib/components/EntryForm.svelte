<script lang="ts">
	import { CalendarIcon, PlusCircle } from '@lucide/svelte';
	import { DateFormatter, getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
	import { challenge as challengeTable, discipline as disciplineTable } from '$lib/db/schema';
	import { addEntry } from '$lib/remote/challenge.remote';
	import { canAddEntries, cn } from '$lib/utils';
	import { Button, buttonVariants } from './ui/button';
	import { Calendar } from './ui/calendar';
	import * as Dialog from './ui/dialog';
	import * as Field from './ui/field';
	import { Input } from './ui/input';
	import * as Popover from './ui/popover';
	import * as Select from './ui/select';

	interface Props {
		disciplines: (typeof disciplineTable.$inferSelect)[];
		challenge: typeof challengeTable.$inferSelect;
		classNames?: string;
	}

	let { disciplines, challenge, classNames }: Props = $props();

	let dialogOpen = $state(false);
	const entryForm = addEntry.for(challenge.id);

	let value = $state<DateValue | undefined>();
	let placeholder = $state<DateValue>();
	let selectedDiscipline = $state('');

	$effect(() => {
		value = today(getLocalTimeZone());
		entryForm.fields.challengeId.set(challenge.id);
	});

	const df = new DateFormatter('de', { dateStyle: 'long' });
	const active = canAddEntries(challenge);

	function getDiscipline(id: string) {
		const qDiscipline = disciplines.find((d) => d.id === id);
		if (!qDiscipline) return null;
		return `${qDiscipline.name} (x${qDiscipline.factor})`;
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		disabled={!active}
		class={cn(
			buttonVariants({ variant: active ? 'default' : 'secondary' }),
			'disabled:cursor-not-allowed max-md:my-auto',
			classNames
		)}
		><PlusCircle />
		{active ? 'Neuer Eintrag' : 'Challenge Inaktiv'}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="h2">Neuer Eintrag</Dialog.Title>
			<form
				{...entryForm.enhance(async ({ submit }) => {
					await submit();
					dialogOpen = false;
				})}
				class="text-left"
			>
				<input hidden {...entryForm.fields.challengeId.as('text')} />
				<p class="text-muted-foreground mb-4 text-sm text-balance max-md:text-center">
					Bitte Kilometer roh eintragen, die Punkte werden später verrechnet
				</p>

				<div class="mb-2 flex gap-4">
					<Field.Field class="w-24 md:w-32">
						<Field.FieldLabel for="entry-amount">Kilometer</Field.FieldLabel>
						<Input id="entry-amount" step="0.01" {...entryForm.fields.amount.as('number')} />
						<Field.FieldError issues={entryForm.fields.amount.issues()} />
					</Field.Field>

					<Field.Field class="grow">
						<Field.FieldLabel for="entry-discipline">Disziplin</Field.FieldLabel>
						<Select.Root
							type="single"
							bind:value={selectedDiscipline}
							name={entryForm.fields.disciplineId.as('select').name}
						>
							<Select.Trigger>
								{selectedDiscipline
									? getDiscipline(selectedDiscipline)
									: 'Disziplin Wählen'}
							</Select.Trigger>
							<Select.Content>
								{#each disciplines as currentDiscipline}
									<Select.Item
										value={currentDiscipline.id}
										label="{currentDiscipline.name} (x{currentDiscipline.factor})"
									/>
								{/each}
							</Select.Content>
						</Select.Root>
						<Field.FieldError issues={entryForm.fields.disciplineId.issues()} />
					</Field.Field>
				</div>

				<Field.Field class="flex flex-col">
					<Field.FieldLabel>Datum der Aktivität</Field.FieldLabel>
					<Popover.Root>
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'justify-start text-left font-normal md:grow',
								!value && 'text-muted-foreground'
							)}
						>
							{value ? df.format(value.toDate(getLocalTimeZone())) : 'Datum wählen'}
							<CalendarIcon class="ml-auto size-4 opacity-50" />
						</Popover.Trigger>
						<Popover.Content side="top">
							<Calendar
								type="single"
								value={value as DateValue}
								bind:placeholder
								minValue={parseDate(challenge.startsAt.toISOString().split('T')[0])}
								maxValue={parseDate(challenge.endsAt.toISOString().split('T')[0])}
								calendarLabel="Tag des Eintrags"
								onValueChange={(v) => {
									if (v) {
										entryForm.fields.date.set(v.toString());
										value = v;
									}
								}}
							/>
						</Popover.Content>
					</Popover.Root>
					<input hidden {...entryForm.fields.date.as('text')} />
					<Field.FieldError issues={entryForm.fields.date.issues()} />
				</Field.Field>
				<Button type="submit" class="mt-2">Hinzufügen</Button>
			</form>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
