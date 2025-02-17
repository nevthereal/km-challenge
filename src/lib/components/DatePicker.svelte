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
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RangeCalendar } from './ui/range-calendar';

	const df = new DateFormatter('de', {
		dateStyle: 'long'
	});

	let {
		startValue = $bindable<DateValue | undefined>(),
		endValue = $bindable<DateValue | undefined>(),
		startName,
		endName
	} = $props();

	let value = $state({ start: startValue, end: endValue });

	$effect(() => {
		value.start = startValue ? parseDate(startValue.toString()) : undefined;
		value.end = endValue ? parseDate(endValue.toString()) : undefined;
	});
</script>

<Popover.Root>
	<Popover.Trigger class="w-auto">
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn('justify-start text-left font-normal', !value && 'text-muted-foreground')}
				{...props}
			>
				<CalendarIcon class="mr-2 size-4" />
				{#if value && value.start}
					{#if value.end}
						{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
							value.end.toDate(getLocalTimeZone())
						)}
					{:else}
						{df.format(value.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if startValue}
					{df.format(startValue.toDate(getLocalTimeZone()))}
				{:else}
					Start- und Enddatum
				{/if}
				<input hidden value={startValue} name={startName} />
				<input hidden value={endValue} name={endName} />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<RangeCalendar
			bind:value
			onValueChange={(v) => {
				if (v) {
					startValue = v.start;
					endValue = v.end;
				}
			}}
		/>
	</Popover.Content>
</Popover.Root>
