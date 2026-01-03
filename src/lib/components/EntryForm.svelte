<script lang="ts">
	import { CalendarIcon, PlusCircle } from '@lucide/svelte';
	import { Button, buttonVariants } from './ui/button';
	import * as Dialog from './ui/dialog';
	import * as Form from './ui/form';
	import * as Select from './ui/select';
	import { Input } from './ui/input';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { newEntry } from '$lib/zod';
	import { challenge as challengeTable, discipline as disciplineTable } from '$lib/db/schema';
	import * as Popover from './ui/popover';
	import { cn, isChallengeActive } from '$lib/utils';

	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import { Calendar } from './ui/calendar';

	/**
	 * Calculate the max date for entry submission (challenge end + 2 days grace period)
	 */
	function getMaxDateForEntry(endsAt: Date): DateValue {
		const maxDate = new Date(endsAt);
		maxDate.setUTCDate(maxDate.getUTCDate() + 2);
		return parseDate(maxDate.toISOString().split('T')[0]);
	}

	interface Props {
		formData: SuperValidated<Infer<typeof newEntry>>;
		disciplines: (typeof disciplineTable.$inferSelect)[];
		challenge: typeof challengeTable.$inferSelect;
		classNames?: string;
	}

	let { formData, disciplines, challenge, classNames }: Props = $props();

	let dialogOpen = $state(false);

	const entryForm = superForm(formData, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				dialogOpen = false;
				resetForm();
			}
		},
		id: `entry-${challenge.id}`,
		multipleSubmits: 'prevent'
	});

	const { enhance, form, constraints, reset } = entryForm;

	function resetForm() {
		reset();
	}

	const df = new DateFormatter('de', {
		dateStyle: 'long'
	});

	let value = $state<DateValue | undefined>();

	$effect(() => {
		value = today(getLocalTimeZone());
	});

	$effect(() => {
		value = $form.date ? parseDate($form.date.toString()) : undefined;
	});

	let placeholder = $state<DateValue>();

	function getDiscipline(id: string) {
		let qDiscipline = disciplines.find((d) => d.id === id);

		if (!qDiscipline) return null;
		return `${qDiscipline.name} (x${qDiscipline.factor})`;
	}
	const active = isChallengeActive(challenge);
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
			<!-- <SuperDebug data={$form} /> -->
			<form
				use:enhance
				action="/clubs/{challenge.clubId}/challenge/{challenge.id}?/newEntry"
				method="post"
				class="text-left"
			>
				<p class="text-muted-foreground mb-4 text-sm text-balance max-md:text-center">
					Bitte Kilometer roh eintragen, die Punkte werden später verrechnet
				</p>

				<div class="mb-2 flex gap-4">
					<Form.Field form={entryForm} name="amount" class="w-24 md:w-32">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Kilometer</Form.Label>
								<Input
									{...props}
									{...$constraints.amount}
									step="0.01"
									type="number"
									bind:value={$form.amount}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={entryForm} name="disciplineId" class="grow">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Disziplin</Form.Label>
								<Select.Root type="single" bind:value={$form.disciplineId} name={props.name}>
									<Select.Trigger {...props}>
										{$form.disciplineId ? getDiscipline($form.disciplineId) : 'Disziplin Wählen'}
									</Select.Trigger>
									<Select.Content>
										{#each disciplines as discipline}
											<Select.Item
												value={discipline.id}
												label="{discipline.name} (x{discipline.factor})"
											/>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Form.Field form={entryForm} name="date" class="flex flex-col">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Datum</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...props}
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
										maxValue={getMaxDateForEntry(challenge.endsAt)}
										calendarLabel="Tag des Eintrags"
										onValueChange={(v) => {
											if (v) {
												$form.date = v.toString();
											} else {
												$form.date = '';
											}
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<Form.FieldErrors />
							<input hidden value={$form.date} name={props.name} />
						{/snippet}
					</Form.Control>
				</Form.Field>
				<Button type="submit" class="mt-2">Hinzufügen</Button>
			</form>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
