<script lang="ts">
	import SuperUser from '$lib/components/SuperUser.svelte';
	import { toast } from 'svelte-sonner';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { cn, prettyDate } from '$lib/utils';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import NiceList, { type ListItems } from '$lib/components/NiceList.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ArrowLeft, Link, PlusCircle } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, form: formData } = $props();

	const form = superForm(data.createForm);

	const { form: formFields, enhance: sfEnhance } = form;

	let { qClub } = data;

	const listItems: ListItems = [
		{
			name: 'Mitglieder',
			content: qClub.members.length.toString()
		},
		{
			name: 'Anzahl Challenges',
			content: qClub.challenges.length.toString()
		}
	];

	let inviteCode = $derived(formData?.code);
	let inviteUrl = $derived(`${page.url.origin}/clubs/join/${inviteCode}`);
	const inviteText = $derived(
		`Trete dem Club ${qClub.name} bei mit dem Code ${inviteCode} oder über diesen Link: ${inviteUrl}`
	);
</script>

<nav class="mb-4 flex">
	<a href="/clubs" class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Alle Clubs</a
	>
</nav>

<h1 class="h1">{qClub.name}</h1>
<NiceList className="mb-4" {listItems} />

<SuperUser user={data.user}>
	<Sheet.Root>
		<Sheet.Trigger class={cn(buttonVariants(), 'max-md:mb-2')}
			><PlusCircle /> Challenge erstellen</Sheet.Trigger
		>
		<Sheet.Content>
			<Sheet.Header>
				<form
					method="post"
					action="?/createChallenge"
					use:sfEnhance
					class="flex max-w-xl flex-col gap-2"
				>
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
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
			><Link /> Einladungslink generieren</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Einladungslink generieren</Dialog.Title>
				<Dialog.Description
					>Diese Aktion macht alle alten Einladungscodes ungültig</Dialog.Description
				>
			</Dialog.Header>
			{#if !inviteCode}
				<Button type="submit" form="generateForm" variant="outline"><Link /> Generieren</Button>
			{:else}
				<div class="flex gap-4">
					<Input value={inviteUrl} readonly />
					<Button
						onclick={async () => {
							await navigator.clipboard.writeText(inviteText);
							toast.success('Link in die Zwischenablage kopiert');
						}}
						variant="outline">Kopieren</Button
					>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</SuperUser>

<div class="mt-6 grid gap-4 md:grid-cols-3">
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

<form id="generateForm" action="?/getCode" method="post" use:enhance hidden></form>
