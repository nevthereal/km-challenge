<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { deleteChallengeCommand, editChallengeForm, getChallengePageContext, joinChallengeCommand, leaveChallengeCommand } from '$lib/remote/challenges.remote';
	import { ArrowLeft, DoorOpen, LogOut, Pencil, Trash2 } from '@lucide/svelte';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { cn, getDaysRemainingForEntry, isChallengeActive, canAddEntries, prettyDate } from '$lib/utils';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let { children } = $props();

	const clubId = $derived(page.params.clubId ?? '');
	const challengeId = $derived(page.params.challengeId ?? '');
	const challengePage = $derived(getChallengePageContext({ clubId, challengeId }));
	const challengeEditForm = $derived(editChallengeForm.for(challengeId));

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);
	let primedChallengeId = $state<string | null>(null);

	function toDateInputValue(date: Date) {
		const offset = date.getTimezoneOffset() * 60_000;
		return new Date(date.getTime() - offset).toISOString().slice(0, 10);
	}

	$effect(() => {
		if (challengePage.current && primedChallengeId !== challengePage.current.challenge.id) {
			challengeEditForm.fields.set({
				name: challengePage.current.challenge.name,
				startsAt: toDateInputValue(new Date(challengePage.current.challenge.startsAt)),
				endsAt: toDateInputValue(new Date(challengePage.current.challenge.endsAt))
			});
			primedChallengeId = challengePage.current.challenge.id;
		}
	});

	const paths = $derived([
		{
			name: 'Übersicht',
			href: resolve('/clubs/[clubId]/challenge/[challengeId]', { clubId, challengeId })
		},
		{
			name: 'Diszipline',
			href: resolve('/clubs/[clubId]/challenge/[challengeId]/disciplines', { clubId, challengeId })
		},
		{
			name: 'Mitglieder',
			href: resolve('/clubs/[clubId]/challenge/[challengeId]/members', { clubId, challengeId })
		},
		{
			name: 'Deine Aktivität',
			href: resolve('/clubs/[clubId]/challenge/[challengeId]/activity', { clubId, challengeId })
		}
	]);

	async function onEditSubmit({ submit }: { submit: any }) {
		await submit();

		if ((challengeEditForm.fields.allIssues()?.length ?? 0) === 0) {
			editDialogOpen = false;
		}
	}

	async function onDeleteChallenge() {
		const result = await deleteChallengeCommand({ clubId, challengeId });

		await goto(resolve('/clubs/[clubId]', { clubId: result.clubId }));
	}

	async function onLeaveChallenge() {
		await leaveChallengeCommand({ clubId, challengeId });
	}

	async function onJoinChallenge() {
		await joinChallengeCommand({ clubId, challengeId });
	}
</script>

<svelte:boundary>
	{@const data = await challengePage}
	{@const { challenge, currentUserChallenge, clubAdmin: isAdmin } = data}
	{@const active = isChallengeActive(challenge)}
	{@const canStillAddEntries = canAddEntries(challenge)}
	{@const daysRemaining = canStillAddEntries ? getDaysRemainingForEntry(challenge) : 0}

	<nav class="mb-4 flex gap-4">
		<a
			href={resolve('/clubs/[clubId]', { clubId: challenge.clubId })}
			class="text-muted-foreground flex items-center gap-2 text-xl font-bold"
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
					<Badge variant="secondary">
						{daysRemaining}
						{daysRemaining === 1 ? 'Tag' : 'Tage'} offen
					</Badge>
				{/if}
			</div>
		</div>
		<div class="flex justify-between max-md:flex-col max-md:gap-4">
			<div class="flex items-center gap-2">
				<ClubAdmin {isAdmin}>
					<AlertDialog.Root bind:open={deleteDialogOpen}>
						<AlertDialog.Trigger class={cn(buttonVariants({ variant: 'destructive' }), 'my-auto')}>
							<Trash2 /><span class="max-md:hidden">Challenge löschen</span>
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Challenge "{challenge.name}" löschen?</AlertDialog.Title>
								<AlertDialog.Description>
									Diese Aktion wird die Challenge mit allen Einträgen und Disziplinen löschen. Diese
									Aktion kann nicht rückgängig gemacht werden.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
								<AlertDialog.Action
									class={buttonVariants({ variant: 'destructive' })}
									onclick={onDeleteChallenge}
								>
									Löschen
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>

					<Dialog.Root bind:open={editDialogOpen}>
						<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
							><Pencil /> <span class="max-md:hidden">Challenge bearbeiten</span></Dialog.Trigger
						>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Challenge bearbeiten</Dialog.Title>
							</Dialog.Header>
							<form {...challengeEditForm.enhance(onEditSubmit)} class="flex max-w-xl flex-col gap-4">
								<Field.Field>
									<Field.Label for="edit-challenge-name">Name</Field.Label>
									<Input id="edit-challenge-name" {...challengeEditForm.fields.name.as('text')} />
									{#each challengeEditForm.fields.name.issues() as issue, index (`edit-challenge-name-${index}-${issue.message}`)}
										<Field.Error>{issue.message}</Field.Error>
									{/each}
								</Field.Field>

								<div class="grid gap-4 md:grid-cols-2">
									<Field.Field>
										<Field.Label for="edit-challenge-start">Start</Field.Label>
										<Input id="edit-challenge-start" {...challengeEditForm.fields.startsAt.as('date')} />
										{#each challengeEditForm.fields.startsAt.issues() as issue, index (`edit-challenge-start-${index}-${issue.message}`)}
											<Field.Error>{issue.message}</Field.Error>
										{/each}
									</Field.Field>

									<Field.Field>
										<Field.Label for="edit-challenge-end">Ende</Field.Label>
										<Input id="edit-challenge-end" {...challengeEditForm.fields.endsAt.as('date')} />
										{#each challengeEditForm.fields.endsAt.issues() as issue, index (`edit-challenge-end-${index}-${issue.message}`)}
											<Field.Error>{issue.message}</Field.Error>
										{/each}
									</Field.Field>
								</div>

								<Button type="submit">Bearbeiten</Button>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				</ClubAdmin>
				{#if currentUserChallenge}
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
								<AlertDialog.Action
									class={buttonVariants({ variant: 'destructive' })}
									onclick={onLeaveChallenge}
								>
									Verlassen
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{:else}
					<Button onclick={onJoinChallenge}><DoorOpen />Beitreten</Button>
				{/if}
			</div>
		</div>
	</div>

	{#if !currentUserChallenge}
		<p class="text-muted-foreground">Du bist kein Mitglied dieser Challenge.</p>
	{:else}
		<nav
			class="my-2 overflow-x-auto border-t-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
		>
			<ul class="flex whitespace-nowrap">
				{#each paths as path (path.href)}
					<a
						class={cn(
							'p-2 font-bold',
							page.url.pathname === path.href && 'bg-muted rounded-b-md'
						)}
						href={path.href}>{path.name}</a
					>
				{/each}
			</ul>
		</nav>
		<div class="mt-2 pt-2">
			{@render children()}
		</div>
	{/if}

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Challenge wird geladen...</p>
	{/snippet}
</svelte:boundary>
