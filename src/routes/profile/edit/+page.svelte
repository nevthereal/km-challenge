<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import { gender, roles } from '$lib/db/schema';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input/';
	import * as Select from '$lib/components/ui/select';
	import { getProfileEditData, updateProfile } from '$lib/remote/profile.remote';

	const { defaults } = await getProfileEditData();
	let role = $state(defaults.role ?? '');
	let userGender = $state(defaults.gender ?? '');
	let username = $state(defaults.username);
</script>

<h1 class="h1">Profil bearbeiten</h1>

<form {...updateProfile} class="max-w-sm space-y-4">
	<Field.Field>
		<Field.FieldLabel for="username">Username</Field.FieldLabel>
		<Input id="username" {...updateProfile.fields.username.as('text')} bind:value={username} />
		<Field.FieldError issues={updateProfile.fields.username.issues()} />
	</Field.Field>

	<Field.Field>
		<Field.FieldLabel for="role">Kategorie</Field.FieldLabel>
		<Select.Root type="single" bind:value={role} name={updateProfile.fields.role.as('select').name}>
			<Select.Trigger id="role">{role || 'Auswählen'}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each roles.enumValues as currentRole}
						<Select.Item value={currentRole} label={currentRole} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Field.FieldError issues={updateProfile.fields.role.issues()} />
	</Field.Field>

	<Field.Field>
		<Field.FieldLabel for="gender">Geschlecht</Field.FieldLabel>
		<Select.Root
			type="single"
			bind:value={userGender}
			name={updateProfile.fields.gender.as('select').name}
		>
			<Select.Trigger id="gender">{userGender || 'Auswählen'}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each gender.enumValues as val}
						<Select.Item value={val} label={val} />
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Field.FieldError issues={updateProfile.fields.gender.issues()} />
	</Field.Field>
	<Button type="submit">Abschicken</Button>
</form>
