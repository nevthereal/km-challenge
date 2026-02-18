<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { createClub, createClubAccess } from '$lib/remote/club.remote';

	await createClubAccess();
</script>

<h1 class="h1">Club Erstellen</h1>

<form {...createClub} class="max-w-sm space-y-4">
	<Field.Field>
		<Field.FieldLabel for="name">Name</Field.FieldLabel>
		<Input id="name" {...createClub.fields.name.as('text')} />
		<Field.FieldError issues={createClub.fields.name.issues()} />
	</Field.Field>
	<Button type="submit">Erstellen</Button>
</form>
