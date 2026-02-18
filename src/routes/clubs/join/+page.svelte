<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { joinClubAccess, submitJoinCode } from '$lib/remote/club.remote';

	await joinClubAccess();
</script>

<main class="flex flex-col items-center">
	<h1 class="h1 mb-4">Club beitreten</h1>
	<form {...submitJoinCode} class="w-full max-w-sm space-y-4">
		<Field.Field>
			<Field.FieldLabel for="code">Einladungscode</Field.FieldLabel>
			<Input id="code" maxlength={6} {...submitJoinCode.fields.code.as('text')} />
			<Field.FieldError issues={submitJoinCode.fields.code.issues()} />
		</Field.Field>
		<Button type="submit" class="w-full">Weiter</Button>
	</form>
</main>
