<script lang="ts">
	import Calendar from '$lib/components/Calendar.svelte';
	import FormCell from '$lib/components/FormCell.svelte';
	import { superForm } from 'sveltekit-superforms';
	let { data } = $props();

	const { form, enhance, constraints } = superForm(data.createForm);
</script>

<h1 class="mb-4 text-6xl font-bold">Challenge Erstellen</h1>
<form method="post" use:enhance class="flex max-w-lg flex-col gap-2">
	<FormCell forAttr="name" label="Name">
		<input name="name" class="input input-primary" type="text" bind:value={$form.name} />
	</FormCell>
	<FormCell forAttr="startsAt" label="Start der Challenge">
		<input
			name="startsAt"
			class="input input-primary"
			type="datetime-local"
			bind:value={$form.startsAt}
		/>
	</FormCell>
	<FormCell forAttr="endsAt" label="Ende der Challenge">
		<input
			name="endsAt"
			class="input input-primary"
			type="datetime-local"
			bind:value={$form.endsAt}
		/>
		<Calendar />
	</FormCell>
	<button class="btn btn-primary mr-auto mt-auto">Erstellen</button>
</form>
