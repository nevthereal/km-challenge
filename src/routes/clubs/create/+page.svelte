<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	const form = superForm(data.form);

	const { enhance, form: formFields } = form;
</script>

<h1 class="h1 mb-8">Club Erstellen</h1>
<form method="POST" use:enhance class="max-w-sm">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input {...props} bind:value={$formFields.name} />
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Button type="submit">Erstellen</Button>
</form>
