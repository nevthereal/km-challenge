<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	let { data } = $props();

	const form = superForm(data.createForm);

	const { form: formFields, enhance } = form;
</script>

<h1 class="mb-4 text-6xl font-bold">Challenge Erstellen</h1>
<form method="post" use:enhance class="flex max-w-xl flex-col gap-2">
	<Form.Field {form} name="name">
		<Form.Control>
			<Form.Label>Name</Form.Label>
			<Input name="name" bind:value={$formFields.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<div class="flex justify-between max-md:flex-col max-md:gap-2">
		<Form.Field {form} name="startsAt" class="flex flex-col">
			<Form.Control>
				<Form.Label>Start der Challenge</Form.Label>
				<DatePicker name="startsAt" bind:value={$formFields.startsAt} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="endsAt" class="flex flex-col">
			<Form.Control>
				<Form.Label>Ende der Challenge</Form.Label>
				<DatePicker name="endsAt" bind:value={$formFields.endsAt} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Button>Submit</Form.Button>
</form>
