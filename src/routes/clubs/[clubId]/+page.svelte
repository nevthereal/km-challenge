<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import * as Field from '$lib/components/ui/field';
	import { toast } from 'svelte-sonner';
	import { deleteClubCommand, editClubForm, generateInviteCode, getClubPage, leaveClubCommand } from '$lib/remote/clubs.remote';
	import { createChallengeForm } from '$lib/remote/challenges.remote';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { cn, isChallengeActive, isChallengePast, prettyDate } from '$lib/utils';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { ArrowLeft, Ellipsis, Link, LogOut, Pencil, PlusCircle, Trash2 } from '@lucide/svelte';

	const clubId = $derived(page.params.clubId ?? '');
	const clubPage = $derived(getClubPage(clubId));
	const createChallenge = $derived(createChallengeForm.for(clubId));
	const editClub = $derived(editClubForm.for(clubId));

	let deleteDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let inviteCode = $state<string | null>(null);
	let primedClubId = $state<string | null>(null);

	$effect(() => {
		if (clubPage.current && primedClubId !== clubPage.current.club.id) {
			editClub.fields.set({
				name: clubPage.current.club.name
			});
			inviteCode = null;
			primedClubId = clubPage.current.club.id;
		}
	});

	const inviteUrl = $derived(inviteCode ? `${page.url.origin}/clubs/join/${inviteCode}` : '');
	const inviteText = $derived(
		clubPage.current && inviteCode
			? `Trete dem Club ${clubPage.current.club.name} bei mit dem Code ${inviteCode} oder über diesen Link:\n${inviteUrl}`
			: ''
	);

	async function onGenerateInvite() {
		const result = await generateInviteCode(clubId);
		inviteCode = result.code;
	}

	async function onDeleteClub() {
		const result = await deleteClubCommand(clubId);

		if (result.redirect) {
			await goto(result.redirect);
		}
	}

	async function onLeaveClub() {
		const result = await leaveClubCommand(clubId);

		if (result.redirect) {
			await goto(result.redirect);
		}
	}

	async function onEditClubSubmit({ submit }: { submit: any }) {
		await submit();

		if ((editClub.fields.allIssues()?.length ?? 0) === 0) {
			editDialogOpen = false;
		}
	}
</script>

<svelte:boundary>
	{@const data = await clubPage}
	{@const club = data.club}
	{@const isAdmin = data.clubAdmin}
	{@const activeChallenges = club.challenges.filter((challenge) => !isChallengePast(challenge))}
	{@const pastChallenges = club.challenges.filter((challenge) => isChallengePast(challenge))}

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
							<AlertDialog.Action
								class={buttonVariants({ variant: 'destructive' })}
								onclick={onLeaveClub}
							>
								Verlassen
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
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
								<Dialog.Root>
									<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
										><Link /> Einladungslink generieren</Dialog.Trigger
									>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Einladungslink generieren</Dialog.Title>
											<Dialog.Description>
												Diese Aktion generiert einen Einladungslink und einen Code.
											</Dialog.Description>
										</Dialog.Header>
										{#if !inviteCode}
											<Button variant="outline" onclick={onGenerateInvite}><Link /> Generieren</Button>
										{:else}
											<div class="flex gap-4">
												<Input value={inviteUrl} readonly />
												<Button
													onclick={async () => {
														await navigator.clipboard.writeText(inviteText);
														toast.success(`Link für ${club.name} in die Zwischenablage kopiert`);
													}}
													variant="outline"
												>
													Kopieren
												</Button>
											</div>
										{/if}
									</Dialog.Content>
								</Dialog.Root>

								<Dialog.Root bind:open={editDialogOpen}>
									<Dialog.Trigger class={buttonVariants({ variant: 'secondary' })}
										><Pencil /> Club bearbeiten</Dialog.Trigger
									>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Club bearbeiten</Dialog.Title>
										</Dialog.Header>
										<form {...editClub.enhance(onEditClubSubmit)} class="space-y-4">
											<Field.Field>
												<Field.Label for="edit-club-name">Name</Field.Label>
												<Input id="edit-club-name" {...editClub.fields.name.as('text')} />
												{#each editClub.fields.name.issues() as issue, index (`edit-club-name-${index}-${issue.message}`)}
													<Field.Error>{issue.message}</Field.Error>
												{/each}
											</Field.Field>
											<Button type="submit">Bearbeiten</Button>
										</form>
									</Dialog.Content>
								</Dialog.Root>

								<AlertDialog.Root bind:open={deleteDialogOpen}>
									<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
										<Trash2 />Club löschen
									</AlertDialog.Trigger>
									<AlertDialog.Content>
										<AlertDialog.Header>
											<AlertDialog.Title>Club "{club.name}" löschen?</AlertDialog.Title>
											<AlertDialog.Description>
												Diese Aktion wird den Club mit all seinen Inhalten löschen. Diese Aktion kann
												nicht rückgängig gemacht werden.
											</AlertDialog.Description>
										</AlertDialog.Header>
										<AlertDialog.Footer>
											<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
											<AlertDialog.Action
												class={buttonVariants({ variant: 'destructive' })}
												onclick={onDeleteClub}
											>
												Löschen
											</AlertDialog.Action>
										</AlertDialog.Footer>
									</AlertDialog.Content>
								</AlertDialog.Root>
							</DropdownMenu.Group>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</ClubAdmin>
		</div>
	</div>

	<div class="mt-6">
		<h2 class="mb-4 text-2xl font-bold">Aktive Challenges</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<ClubAdmin {isAdmin}>
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
							<Sheet.Title>Challenge erstellen</Sheet.Title>
						</Sheet.Header>
						<form {...createChallenge} class="mt-6 flex max-w-xl flex-col gap-4">
							<Field.Field>
								<Field.Label for="challenge-name">Name</Field.Label>
								<Input id="challenge-name" {...createChallenge.fields.name.as('text')} />
								{#each createChallenge.fields.name.issues() as issue, index (`create-challenge-name-${index}-${issue.message}`)}
									<Field.Error>{issue.message}</Field.Error>
								{/each}
							</Field.Field>

							<div class="grid gap-4 md:grid-cols-2">
								<Field.Field>
									<Field.Label for="challenge-start">Start</Field.Label>
									<Input id="challenge-start" {...createChallenge.fields.startsAt.as('date')} />
									{#each createChallenge.fields.startsAt.issues() as issue, index (`create-challenge-start-${index}-${issue.message}`)}
										<Field.Error>{issue.message}</Field.Error>
									{/each}
								</Field.Field>

								<Field.Field>
									<Field.Label for="challenge-end">Ende</Field.Label>
									<Input id="challenge-end" {...createChallenge.fields.endsAt.as('date')} />
									{#each createChallenge.fields.endsAt.issues() as issue, index (`create-challenge-end-${index}-${issue.message}`)}
										<Field.Error>{issue.message}</Field.Error>
									{/each}
								</Field.Field>
							</div>

							<Button type="submit">Erstellen</Button>
						</form>
					</Sheet.Content>
				</Sheet.Root>
			</ClubAdmin>

			{#each activeChallenges as challenge (challenge.id)}
				<a href="/clubs/{club.id}/challenge/{challenge.id}">
					<Card.Root>
						<Card.Header>
							<Card.Title>{challenge.name}</Card.Title>
							<Card.Description class={cn(isChallengeActive(challenge) && 'text-green-500')}
								>{prettyDate(new Date(challenge.startsAt))} - {prettyDate(
									new Date(challenge.endsAt)
								)}</Card.Description
							>
						</Card.Header>
						<Card.Footer>
							<p class="mt-4">{challenge.members.length} Teilnehmer</p>
						</Card.Footer>
					</Card.Root>
				</a>
			{:else}
				<p class="text-muted-foreground">Keine aktiven Challenges.</p>
			{/each}
		</div>

		{#if pastChallenges.length > 0}
			<h2 class="mt-8 mb-4 text-2xl font-bold">Vergangene Challenges</h2>
			<div class="grid gap-4 md:grid-cols-3">
				{#each pastChallenges as challenge (challenge.id)}
					<a href="/clubs/{club.id}/challenge/{challenge.id}">
						<Card.Root class="opacity-75 duration-200 ease-in-out hover:opacity-100">
							<Card.Header>
								<Card.Title>{challenge.name}</Card.Title>
								<Card.Description
									>{prettyDate(new Date(challenge.startsAt))} - {prettyDate(
										new Date(challenge.endsAt)
									)}</Card.Description
								>
							</Card.Header>
							<Card.Footer>
								<p class="mt-4">{challenge.members.length} Teilnehmer</p>
							</Card.Footer>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	{#snippet pending()}
		<p class="text-muted-foreground font-mono italic">Club wird geladen...</p>
	{/snippet}
</svelte:boundary>
