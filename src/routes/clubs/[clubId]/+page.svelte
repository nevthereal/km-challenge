<script lang="ts">
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { toast } from 'svelte-sonner';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { cn, isActive, prettyDate } from '$lib/utils';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { ArrowLeft, Ellipsis, Link, LogOut, Pencil, PlusCircle, Trash2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, form: formData } = $props();

	const createForm = superForm(data.createForm);
	const editClubForm = superForm(data.editClubForm, {
		onResult: ({ result }) => {
			if ((result.type = 'success')) editDialogOpen = !editDialogOpen;
		}
	});

	const { form: createFormFields, enhance: createEnhance } = createForm;
	const {
		form: editFormFields,
		enhance: editFormEnhance,
		constraints: editFormContraints
	} = editClubForm;

	let { qClub: club } = $derived(data);

	let inviteCode = $derived(formData?.code);
	let inviteUrl = $derived(`${page.url.origin}/clubs/join/${inviteCode}`);
	const inviteText = $derived(
		`Trete dem Club ${club.name} bei mit dem Code ${inviteCode} oder über diesen Link: \n${inviteUrl}`
	);

	const isAdmin = data.clubAdmin;

	let deleteDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);
	let editDialogOpen = $state(false);
</script>

<nav class="mb-4 flex">
	<a href="/clubs" class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
		><ArrowLeft strokeWidth={3} /> Alle Clubs</a
	>
</nav>

<div class="flex items-center justify-between max-md:flex-col max-md:items-start">
	<div class="mb-2 md:mb-4">
		<h1 class="h1">{club.name}</h1>
	</div>
	<div>
		{#if !isAdmin}
			{@render leaveDialog()}
		{/if}
		<ClubAdmin {isAdmin}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
					><Ellipsis />Optionen
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading>Mehr Optionen</DropdownMenu.GroupHeading>
						<DropdownMenu.Separator />
						<DropdownMenu.Group class="flex flex-col gap-2 p-2">
							{@render linkDialog()}
							{@render editDialog()}
							{@render deleteDialog()}
						</DropdownMenu.Group>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</ClubAdmin>
	</div>
</div>

<div class="mt-6 grid gap-4 md:grid-cols-3">
	<ClubAdmin {isAdmin}>
		{@render challengeSheet()}
	</ClubAdmin>
	{#each club.challenges as challenge}
		<a href="/clubs/{club.id}/challenge/{challenge.id}">
			<Card.Root>
				<Card.Header>
					<Card.Title>{challenge.name}</Card.Title>
					<Card.Description
						class={cn(
							isActive({ finish: challenge.endsAt, start: challenge.startsAt }) && 'text-green-500'
						)}
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
	{:else}
		<p class="text-center">Dieser Club hat noch keine Challenges.</p>
	{/each}
</div>

<form id="generateForm" action="?/getCode" method="post" use:enhance hidden></form>
<form id="deleteForm" action="?/deleteClub" method="post" use:enhance hidden></form>
<form id="leaveForm" action="?/leave" method="post" use:enhance hidden></form>

{#snippet challengeSheet()}
	<Sheet.Root>
		<Sheet.Trigger>
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-center">Challenge erstellen</Card.Title>
				</Card.Header>
				<Card.Content class="flex justify-center">
					<PlusCircle size={36} />
				</Card.Content>
			</Card.Root>
		</Sheet.Trigger>
		<Sheet.Content>
			<Sheet.Header>
				<form
					method="post"
					action="?/createChallenge"
					use:createEnhance
					class="flex max-w-xl flex-col gap-2"
				>
					<Form.Field form={createForm} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$createFormFields.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={createForm} name="startsAt" class="flex flex-col">
						<Form.Control>
							{#snippet children()}
								<Form.Label>Dauer der Challenge</Form.Label>
								<Form.Description
									>Bitte Enddatum im Stil "bis", anstatt "bis und mit" wählen, weil die Endzeit auf
									00:00 gesetzt wird.</Form.Description
								>
								<DatePicker
									startName="startsAt"
									endName="endsAt"
									bind:startValue={$createFormFields.startsAt}
									bind:endValue={$createFormFields.endsAt}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button>Erstellen</Form.Button>
				</form>
			</Sheet.Header>
		</Sheet.Content>
	</Sheet.Root>
{/snippet}

{#snippet linkDialog()}
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
			><Link /> Einladungslink generieren</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Einladungslink generieren</Dialog.Title>
				<Dialog.Description
					>Diese Aktion generiert einen Einladungslink und einen Code.</Dialog.Description
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
{/snippet}

{#snippet editDialog()}
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
			><Pencil /> Club bearbeiten</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Club bearbeiten</Dialog.Title>
			</Dialog.Header>
			<form use:editFormEnhance action="?/edit" method="post">
				<Form.Field form={editClubForm} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} {...$editFormContraints.name} bind:value={$editFormFields.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Button type="submit">Bearbeiten</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet deleteDialog()}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
			<Trash2 />Club löschen
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Club "{club.name}" löschen?</AlertDialog.Title>
				<AlertDialog.Description>
					Diese Aktion wird den Club mit all seinen Inhalten löschen. Diese Aktion kann nicht
					rückgängig gemacht werden.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action form="deleteForm" class={buttonVariants({ variant: 'destructive' })}
					>Löschen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}

{#snippet leaveDialog()}
	<AlertDialog.Root bind:open={leaveDialogOpen}>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			<LogOut />Club verlassen
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Club "{club.name}" verlassen?</AlertDialog.Title>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action form="leaveForm" class={buttonVariants({ variant: 'destructive' })}
					>Verlassen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
