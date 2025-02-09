<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/';
	import * as Select from '$lib/components/ui/select';
	import { gender, roles } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button/';

	let { data } = $props();

	const form = superForm(data.form);

	const { enhance, form: formFields } = form;
</script>

<h1 class="h1">Profil bearbeiten</h1>

<form method="post" use:enhance class="max-w-sm">
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Username</Form.Label>
				<Input {...props} bind:value={$formFields.username} />
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="role">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Kategorie</Form.Label>
				<Select.Root type="single" bind:value={$formFields.role} name={props.name}>
					<Select.Trigger {...props}>
						{$formFields.role ? $formFields.role : 'Auswählen'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each roles.enumValues as role}
								<Select.Item value={role} label={role} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="gender">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Geschlecht</Form.Label>
				<Select.Root type="single" bind:value={$formFields.gender} name={props.name}>
					<Select.Trigger {...props}>
						{$formFields.gender ? $formFields.gender : 'Auswählen'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each gender.enumValues as val}
								<Select.Item value={val} label={val} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Button type="submit">Abschicken</Button>
</form>
