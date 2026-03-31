<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { createClubForm, getCreateClubPage } from '$lib/remote/clubs.remote';

	const createClubPage = getCreateClubPage();
	await createClubPage;
</script>

<h1 class="h1">Club Erstellen</h1>
<form {...createClubForm} class="max-w-sm">
	<Field.Field>
		<Field.Label for="club-name">Name</Field.Label>
		<Input id="club-name" {...createClubForm.fields.name.as('text')} />
		{#each createClubForm.fields.name.issues() as issue, index (`create-club-name-${index}-${issue.message}`)}
			<Field.Error>{issue.message}</Field.Error>
		{/each}
	</Field.Field>
	<Button type="submit">Erstellen</Button>
</form>
