<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { getJoinClubPage, joinClubByCodeForm } from '$lib/remote/clubs.remote';

	const joinClubPage = getJoinClubPage();
	await joinClubPage;
</script>

<main class="flex flex-col items-center">
	<h1 class="h1 mb-4">Club beitreten</h1>
	<form {...joinClubByCodeForm} class="flex w-full max-w-sm flex-col space-y-6">
		<Field.Field>
			<Field.Label for="join-code">Einladungscode</Field.Label>
			<Input
				id="join-code"
				class="text-center font-mono tracking-[0.35em]"
				maxlength={6}
				placeholder="ABC123"
				{...joinClubByCodeForm.fields.code.as('text')}
			/>
			{#each joinClubByCodeForm.fields.code.issues() as issue, index (`join-club-code-${index}-${issue.message}`)}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
		</Field.Field>
		<Button type="submit">Weiter</Button>
	</form>
</main>
