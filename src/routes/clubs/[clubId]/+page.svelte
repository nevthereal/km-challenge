<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { prettyDate } from '$lib/utils';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	const form = superForm(data.createForm);

	const { form: formFields, enhance } = form;

	let { qClub } = data;
</script>

<h1>{qClub.name}</h1>

{#if data.user.superUser}
	<Sheet.Root>
		<Sheet.Trigger><Button>Challenge erstellen</Button></Sheet.Trigger>
		<Sheet.Content>
			<Sheet.Header>
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
							{#snippet children()}
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
			</Sheet.Header>
		</Sheet.Content>
	</Sheet.Root>
{/if}

<div class="grid grid-cols-3 gap-4">
	{#each qClub.challenges as challenge}
		<a href={`/clubs/${qClub.id}/challenge/${challenge.id}`}>
			<Card.Root>
				<Card.Header>
					<Card.Title>{challenge.name}</Card.Title>
					<Card.Description
						>{prettyDate(new Date(challenge.startsAt))} - {prettyDate(
							new Date(challenge.endsAt)
						)}</Card.Description
					>
				</Card.Header>
				<Card.Footer>
					<p class="mt-4">
						{challenge.members.length} Teilnehmer
					</p>
				</Card.Footer>
			</Card.Root>
		</a>
	{/each}
</div>
