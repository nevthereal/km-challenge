<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, DoorOpen, LogOut, Pencil, Trash2 } from '@lucide/svelte';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { cn, isChallengeActive, prettyDate, canAddEntries, getDaysRemainingForEntry } from '$lib/utils';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { page } from '$app/state';
	import { parseDate, type DateValue } from '@internationalized/date';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import * as Field from '$lib/components/ui/field';
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		deleteChallenge,
		editChallenge,
		getChallengeLayoutData,
		joinChallenge,
		leaveChallenge
	} from '$lib/remote/challenge.remote';

	let { children } = $props();

	const clubId = page.params.clubId ?? '';
	const challengeId = page.params.challengeId ?? '';
	const data = await getChallengeLayoutData({ clubId, challengeId });

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);

	const { challenge, currentUserChallenge, clubAdmin: isAdmin, challengePath } = data;

	let challengeStart = $state<DateValue | undefined>();
	let challengeEnd = $state<DateValue | undefined>();

	$effect(() => {
		editChallenge.fields.clubId.set(clubId);
		editChallenge.fields.challengeId.set(challengeId);

		if (!editChallenge.fields.name.value()) editChallenge.fields.name.set(challenge.name);
		if (!editChallenge.fields.startsAt.value()) {
			const start = challenge.startsAt.toISOString().split('T')[0];
			editChallenge.fields.startsAt.set(start);
			challengeStart = parseDate(start);
		}
		if (!editChallenge.fields.endsAt.value()) {
			const end = challenge.endsAt.toISOString().split('T')[0];
			editChallenge.fields.endsAt.set(end);
			challengeEnd = parseDate(end);
		}
	});

	const paths = [
		{ name: 'Übersicht', href: '' },
		{ name: 'Diszipline', href: '/disciplines' },
		{ name: 'Mitglieder', href: '/members' },
		{ name: 'Deine Aktivität', href: '/activity' }
	];

	const active = isChallengeActive(challenge);
	const canStillAddEntries = canAddEntries(challenge);
	const daysRemaining = canStillAddEntries ? getDaysRemainingForEntry(challenge) : 0;
</script>

<nav class="mb-4 flex gap-4">
	<a href="/clubs/{challenge.clubId}" class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
		><ArrowLeft strokeWidth={3} /> Zum Club</a
	>
</nav>
<div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
	<div>
		<h1 class="h1 mb-4">{challenge.name}</h1>
		<div class="flex items-center gap-3">
			<p class={cn(active && 'my-2 text-green-500')}>
				{prettyDate(challenge.startsAt)} - {prettyDate(challenge.endsAt)}
			</p>
			{#if canStillAddEntries && daysRemaining > 0}
				<Badge variant="secondary">{daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'} offen</Badge>
			{/if}
		</div>
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
				<Button
					type="button"
					onclick={async () => {
						await joinChallenge({ clubId, challengeId });
						location.reload();
					}}><DoorOpen />Beitreten</Button
				>
			{/if}
		</div>
	</div>
</div>

{#if !currentUserChallenge}
	<p class="text-muted-foreground">Du bist kein Mitglied dieser Challenge.</p>
{:else}
	<nav class="my-2 overflow-x-auto border-t-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
		<ul class="flex whitespace-nowrap">
			{#each paths as path}
				<a
					class={cn('p-2 font-bold', page.url.pathname === `${challengePath}${path.href}` && 'bg-muted rounded-b-md')}
					href="{challengePath}{path.href}">{path.name}</a
				>
			{/each}
		</ul>
	</nav>
	<div class="mt-2 pt-2">{@render children()}</div>
{/if}

{#snippet editDialog()}
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}><Pencil /> <span class="max-md:hidden">Challenge bearbeiten</span></Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header><Dialog.Title>Challenge bearbeiten</Dialog.Title></Dialog.Header>
			<form
				{...editChallenge.enhance(async ({ submit }) => {
					await submit();
					editDialogOpen = false;
					location.reload();
				})}
				class="flex max-w-xl flex-col gap-2"
			>
				<input hidden {...editChallenge.fields.clubId.as('text')} />
				<input hidden {...editChallenge.fields.challengeId.as('text')} />
				<Field.Field>
					<Field.FieldLabel for="challenge-edit-name">Name</Field.FieldLabel>
					<Input id="challenge-edit-name" {...editChallenge.fields.name.as('text')} />
					<Field.FieldError issues={editChallenge.fields.name.issues()} />
				</Field.Field>
				<Field.Field class="flex flex-col">
					<Field.FieldLabel>Dauer der Challenge</Field.FieldLabel>
					<Field.FieldDescription>Bitte Enddatum im Stil "bis", anstatt "bis und mit" wählen, weil die Endzeit auf 00:00 gesetzt wird.</Field.FieldDescription>
					<DatePicker
						startName={editChallenge.fields.startsAt.as('text').name}
						endName={editChallenge.fields.endsAt.as('text').name}
						bind:startValue={challengeStart}
						bind:endValue={challengeEnd}
					/>
					<Field.FieldError issues={editChallenge.fields.startsAt.issues()} />
					<Field.FieldError issues={editChallenge.fields.endsAt.issues()} />
				</Field.Field>
				<Button type="submit">Bearbeiten</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet deleteDialog()}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Trigger class={cn(buttonVariants({ variant: 'destructive' }), 'my-auto')}><Trash2 /><span class="max-md:hidden">Challenge löschen</span></AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Challenge "{challenge.name}" löschen?</AlertDialog.Title>
				<AlertDialog.Description>Diese Aktion wird die Challenge mit allen Einträgen und Disziplinen löschen. Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action onclick={async () => await deleteChallenge({ clubId, challengeId })} class={buttonVariants({ variant: 'destructive' })}>Löschen</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}

{#snippet leaveDialog()}
	<AlertDialog.Root bind:open={leaveDialogOpen}>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'outline' })}><LogOut />Verlassen</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header><AlertDialog.Title>Challenge "{challenge.name}" verlassen?</AlertDialog.Title></AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={async () => {
						await leaveChallenge({ challengeId });
						location.reload();
					}}
					class={buttonVariants({ variant: 'destructive' })}>Verlassen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
