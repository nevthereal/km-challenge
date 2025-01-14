<script lang="ts">
	import dayjs from 'dayjs';
	import { Calendar, ChevronLeft, ChevronRight } from 'lucide-svelte';

	const months = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];

	let calendarModal = $state() as HTMLDialogElement;

	let selectedDate = $state(dayjs());

	let daysInMonth = $derived(selectedDate.daysInMonth());

	const today = dayjs();

	let selectedMonth = $derived(months[selectedDate.month()]);

	$inspect(selectedDate, selectedMonth);
</script>

<button onclick={() => calendarModal.showModal()} aria-label="date picker" class="btn"
	><Calendar /></button
>

<!-- <dialog bind:this={calendarModal} class="modal"> -->
<!-- <div class="modal-box"> -->
<div class="fixed z-50 rounded-box bg-base-200 p-4">
	<div class="flex justify-between">
		<button onclick={() => selectedDate.subtract(1, 'month')}><ChevronLeft /></button>
		<p>
			{selectedMonth}
		</p>
		<button onclick={() => selectedDate.add(1, 'month')}><ChevronRight /></button>
	</div>
	<div class="grid grid-cols-7 gap-4">
		{#each { length: daysInMonth }, idx}
			<button class={'btn btn-square btn-outline btn-sm'}>{idx + 1}</button>
		{/each}
	</div>
</div>
<!-- </div> -->
<!-- </dialog> -->
