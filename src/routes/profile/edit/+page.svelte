<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input/';
	import { gender, roles } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button/';
	import { getProfile, updateProfile } from '$lib/remote/profile.remote';

	type RoleValue = (typeof roles.enumValues)[number];
	type GenderValue = (typeof gender.enumValues)[number];

	const profile = getProfile();
	const profileData = await profile;
	updateProfile.fields.set({
		username: profileData.user.name,
		role: (profileData.user.role ?? 'Coach') as RoleValue,
		gender: (profileData.user.gender ?? 'M') as GenderValue
	});
</script>

<h1 class="h1">Profil bearbeiten</h1>

<form {...updateProfile} class="max-w-sm space-y-4">
	<Field.Field>
		<Field.Label for="username">Username</Field.Label>
		<Input id="username" {...updateProfile.fields.username.as('text')} />
		{#each updateProfile.fields.username.issues() as issue, index (`profile-username-${index}-${issue.message}`)}
			<Field.Error>{issue.message}</Field.Error>
		{/each}
	</Field.Field>

	<Field.Field>
		<Field.Label for="role">Kategorie</Field.Label>
		<select
			id="role"
			class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
			{...updateProfile.fields.role.as('select')}
		>
			{#each roles.enumValues as role (role)}
				<option value={role}>{role}</option>
			{/each}
		</select>
		{#each updateProfile.fields.role.issues() as issue, index (`profile-role-${index}-${issue.message}`)}
			<Field.Error>{issue.message}</Field.Error>
		{/each}
	</Field.Field>

	<Field.Field>
		<Field.Label for="gender">Geschlecht</Field.Label>
		<select
			id="gender"
			class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
			{...updateProfile.fields.gender.as('select')}
		>
			{#each gender.enumValues as value (value)}
				<option value={value}>{value}</option>
			{/each}
		</select>
		{#each updateProfile.fields.gender.issues() as issue, index (`profile-gender-${index}-${issue.message}`)}
			<Field.Error>{issue.message}</Field.Error>
		{/each}
	</Field.Field>

	<Button type="submit">Abschicken</Button>
</form>
