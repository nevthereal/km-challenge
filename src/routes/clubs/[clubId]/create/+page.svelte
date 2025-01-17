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
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formFields.name} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="startsAt" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Start der Challenge</Form.Label>
				<DatePicker
					startName="startsAt"
					endName="endsAt"
					bind:startValue={$formFields.startsAt}
					bind:endValue={$formFields.endsAt}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
