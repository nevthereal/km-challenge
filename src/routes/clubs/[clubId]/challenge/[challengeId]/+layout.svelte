<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, DoorOpen, LogOut, Pencil, Trash2 } from 'lucide-svelte';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { cn, isActive, prettyDate } from '$lib/utils';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import Input from '$lib/components/ui/input/input.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';

	let { data, children } = $props();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);

	const { challenge, currentUserChallenge, clubAdmin: isAdmin, challengePath } = $derived(data);

	const form = superForm(data.editForm, {
		onResult: ({ result }) => {
			if (result.type === 'success') editDialogOpen = false;
		}
	});

	const { form: formFields, constraints: editConstraints, enhance: editEnhance } = form;

	const paths = [
		{
			name: 'Übersicht',
			href: ''
		},
		{
			name: 'Diszipline',
			href: '/disciplines'
		},
		{
			name: 'Mitglieder',
			href: '/members'
		},
		{
			name: 'Deine Aktivität',
			href: '/activity'
		}
	];

	const active = $derived(isActive({ start: challenge.startsAt, finish: challenge.endsAt }));
</script>

<nav class="mb-4 flex gap-4">
	<a
		href="/clubs/{challenge.clubId}"
		class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
		><ArrowLeft strokeWidth={3} /> Zum Club</a
	>
</nav>
<div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
	<div>
		<h1 class="h1 mb-4">{challenge.name}</h1>
		<p class={cn(active && 'my-2 text-green-500')}>
			{prettyDate(challenge.startsAt)} - {prettyDate(challenge.endsAt)}
		</p>
	</div>
	<div class="flex justify-between max-md:flex-col max-md:gap-4">
		<div class="flex items-center gap-2">
			<ClubAdmin {isAdmin}>
				{@render deleteDialog()}
				{@render editDialog()}
			</ClubAdmin>
			{#if currentUserChallenge}
				{@render leaveDialog()}
			{:else}
				<Button type="submit" form="joinForm"><DoorOpen />Beitreten</Button>
			{/if}
		</div>
	</div>
</div>

{#if !currentUserChallenge}
	<p class="text-muted-foreground">Du bist kein Mitglied dieser Challenge.</p>
{:else}
	<nav class="my-2 overflow-x-scroll border-t-2">
		<ul class="flex whitespace-nowrap">
			{#each paths as path}
				<a
					class={cn(
						'p-2 font-bold',
						page.url.pathname === `${challengePath}${path.href}` && 'bg-muted rounded-b-md'
					)}
					href="{challengePath}{path.href}">{path.name}</a
				>
			{/each}
		</ul>
	</nav>
	<div class="mt-2 pt-2">
		{@render children()}
	</div>
{/if}

<form
	id="deleteForm"
	hidden
	action="{challengePath}/?/deleteChallenge"
	use:enhance
	method="post"
></form>
<form id="leaveForm" action="{challengePath}/?/leave" method="post" use:enhance hidden></form>
<form id="joinForm" action="{challengePath}/?/join" method="post" use:enhance hidden></form>

{#snippet editDialog()}
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
			><Pencil /> <span class="max-md:hidden">Challenge bearbeiten</span></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Challenge bearbeiten</Dialog.Title>
			</Dialog.Header>
			<form
				method="post"
				action="{challengePath}/?/editChallenge"
				use:editEnhance
				class="flex max-w-xl flex-col gap-2"
			>
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} {...$editConstraints.name} bind:value={$formFields.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="startsAt" class="flex flex-col">
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
								bind:startValue={$formFields.startsAt}
								bind:endValue={$formFields.endsAt}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Bearbeiten</Form.Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet deleteDialog()}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Trigger class={cn(buttonVariants({ variant: 'destructive' }), 'my-auto')}>
			<Trash2 /><span class="max-md:hidden">Challenge löschen</span>
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Challenge "{challenge.name}" löschen?</AlertDialog.Title>
				<AlertDialog.Description>
					Diese Aktion wird die Challenge mit allen Einträgen und Disziplinen löschen. Diese Aktion
					kann nicht rückgängig gemacht werden.
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
			<LogOut />Verlassen
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Challenge "{challenge.name}" verlassen?</AlertDialog.Title>
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
