<script lang="ts">
	import { CalendarIcon, PlusCircle } from 'lucide-svelte';
	import { Button, buttonVariants } from './ui/button';
	import * as Dialog from './ui/dialog';
	import * as Form from './ui/form';
	import * as Select from './ui/select';
	import { Input } from './ui/input';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { newEntry } from '$lib/zod';
	import { challenge as challengeTable, discipline as disciplineTable } from '$lib/db/schema';
	import * as Popover from './ui/popover';
	import { cn, isActive } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue,
		parseDateTime
	} from '@internationalized/date';
	import { Calendar } from './ui/calendar';
	import { toast } from 'svelte-sonner';

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
			if (result.type === 'success') dialogOpen = !dialogOpen;
		},
		onUpdated: ({ form }) => {
			if (form.valid) toast.success('Eintrag hinzugefügt');
		},
		id: `entry-${challenge.id}`
	});

	const { enhance, form, constraints } = entryForm;

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
	const active = isActive({ finish: challenge.endsAt, start: challenge.startsAt });
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
		<span class="max-md:hidden">{active ? 'Neuer Eintrag' : 'Challenge Inaktiv'}</span
		></Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="h2">Neuer Eintrag</Dialog.Title>
			<!-- <SuperDebug data={$form} /> -->
			<form
				use:enhance
				action={`/clubs/${challenge.clubId}/challenge/${challenge.id}?/newEntry`}
				method="post"
			>
				<div class="flex gap-4">
					<Form.Field form={entryForm} name="amount">
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

					<Form.Field form={entryForm} name="date">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Datum</Form.Label>
								<Popover.Root>
									<Popover.Trigger
										{...props}
										class={cn(
											buttonVariants({ variant: 'outline' }),
											'w-[280px] justify-start pl-4 text-left font-normal',
											!value && 'text-muted-foreground'
										)}
									>
										{value ? df.format(value.toDate(getLocalTimeZone())) : 'Datum wählen'}
										<CalendarIcon class="ml-auto size-4 opacity-50" />
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0" side="top">
										<Calendar
											type="single"
											value={value as DateValue}
											bind:placeholder
											minValue={parseDate(challenge.startsAt.toISOString().split('T')[0])}
											maxValue={today(getLocalTimeZone())}
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
				</div>
				<Form.Field form={entryForm} name="disciplineId">
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
											label={`${discipline.name} (x${discipline.factor})`}
										/>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Button type="submit" class="mt-auto">Hinzufügen</Button>
			</form>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
