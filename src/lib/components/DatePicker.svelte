<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		parseAbsolute
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RangeCalendar } from './ui/range-calendar';
	import type { DateRange } from 'bits-ui';

	const df = new DateFormatter('de', {
		dateStyle: 'long'
	});

	let {
		startValue = $bindable<DateValue | undefined>(),
		endValue = $bindable<DateValue | undefined>(),
		startName,
		endName
	}: {
		startValue: DateValue | undefined;
		endValue: DateValue | undefined;
		startName: string;
		endName: string;
	} = $props();

	let value = $state<DateRange>({ start: startValue, end: endValue });

	// Expose ISO date strings via accessors on a form object (zod-compatible)
	const form = {
		get startsAt() {
			return startValue ? startValue.toDate(getLocalTimeZone()).toISOString() : '';
		},
		set startsAt(v) {
			startValue = v ? parseAbsolute(v, getLocalTimeZone()) : undefined;
		},
		get endsAt() {
			return endValue ? endValue.toDate(getLocalTimeZone()).toISOString() : '';
		},
		set endsAt(v) {
			endValue = v ? parseAbsolute(v, getLocalTimeZone()) : undefined;
		}
	};
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
				<input hidden value={form.startsAt} name={startName} />
				<input hidden value={form.endsAt} name={endName} />
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
