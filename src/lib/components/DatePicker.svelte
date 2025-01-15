<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const df = new DateFormatter('de', {
		dateStyle: 'long'
	});

	let { value = $bindable<DateValue | undefined>(), name } = $props();
	let dateValue = $state<DateValue | undefined>();

	// Sync the string date value with the DateValue object
	$effect(() => {
		dateValue = value ? parseDate(value.toString()) : undefined;
	});
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn(
					'w-[280px] justify-start text-left font-normal',
					!dateValue && 'text-muted-foreground'
				)}
				{...props}
			>
				<CalendarIcon class="mr-2 size-4" />
				{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : 'Datum auswählen'}
				<input hidden {value} {name} />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar
			bind:value={dateValue}
			type="single"
			initialFocus
			onValueChange={(v) => {
				if (v) {
					value = v;
				} else {
					value = undefined;
				}
			}}
		/>
	</Popover.Content>
</Popover.Root>
