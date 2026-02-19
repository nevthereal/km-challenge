<script lang="ts">
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		Ellipsis,
		Link,
		LogOut,
		Pencil,
		PlusCircle,
		Trash2
	} from '@lucide/svelte';
	import { parseDate, type DateValue } from '@internationalized/date';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet';
	import { cn, isChallengeActive, isChallengePast, prettyDate } from '$lib/utils';
	import {
		createChallengeInClub,
		deleteClub,
		editClubDetails,
		getClubPageData,
		getClubsPageData,
		getInviteCode,
		leaveClub
	} from '$lib/remote/club.remote';

	const clubId = $derived(page.params.clubId ?? '');
	const clubData = $derived(getClubPageData({ clubId }));
	const data = $derived(await clubData);
	let { qClub: club } = $derived(data);

	let inviteCode = $state<string | null>(null);
	let challengeStart = $state<DateValue | undefined>(parseDate(new Date().toISOString().split('T')[0]));
	let challengeEnd = $state<DateValue | undefined>(parseDate(new Date().toISOString().split('T')[0]));

	let previousClubId = $state<string | null>(null);

	$effect(() => {
		if (clubId) {
			createChallengeInClub.fields.clubId.set(clubId);
			editClubDetails.fields.clubId.set(clubId);
		}

		if (previousClubId !== null && previousClubId !== clubId) {
			inviteCode = '';
			editClubDetails.fields.name.set(club.name);
		}
		previousClubId = clubId;
	});

	const inviteUrl = $derived(
		inviteCode ? `${page.url.origin}/clubs/join/${inviteCode}` : `${page.url.origin}/clubs/join`
	);
	const inviteText = $derived(
		`Trete dem Club ${club.name} bei mit dem Code ${inviteCode} oder über diesen Link: \n${inviteUrl}`
	);

	const isAdmin = $derived(data.isClubAdmin);

	let deleteDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);
	let editDialogOpen = $state(false);

	const activeChallenges = $derived(club.challenges.filter((challenge) => !isChallengePast(challenge)));
	const pastChallenges = $derived(club.challenges.filter((challenge) => isChallengePast(challenge)));
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

<div class="mt-6">
	<h2 class="mb-4 text-2xl font-bold">Aktive Challenges</h2>
	<div class="grid gap-4 md:grid-cols-3">
		<ClubAdmin {isAdmin}>
			{@render challengeSheet()}
		</ClubAdmin>
		{#each activeChallenges as challenge}
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
			{#each pastChallenges as challenge}
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
				<form {...createChallengeInClub} class="flex max-w-xl flex-col gap-2">
					<input hidden {...createChallengeInClub.fields.clubId.as('text')} />
					<Field.Field>
						<Field.FieldLabel for="challenge-name">Name</Field.FieldLabel>
						<Input id="challenge-name" {...createChallengeInClub.fields.name.as('text')} />
						<Field.FieldError issues={createChallengeInClub.fields.name.issues()} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Dauer der Challenge</Field.FieldLabel>
						<Field.FieldDescription
							>Bitte Enddatum im Stil "bis", anstatt "bis und mit" wählen, weil die Endzeit auf
							00:00 gesetzt wird.</Field.FieldDescription
						>
						<DatePicker
							startName={createChallengeInClub.fields.startsAt.as('text').name}
							endName={createChallengeInClub.fields.endsAt.as('text').name}
							bind:startValue={challengeStart}
							bind:endValue={challengeEnd}
						/>
						<Field.FieldError issues={createChallengeInClub.fields.startsAt.issues()} />
						<Field.FieldError issues={createChallengeInClub.fields.endsAt.issues()} />
					</Field.Field>
					<Button type="submit">Erstellen</Button>
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
				<Button
					type="button"
					variant="outline"
					onclick={async () => {
						try {
							const result = await getInviteCode({ clubId });
							inviteCode = result.code ?? null;
						} catch (e) {
							toast.error('Einladungscode konnte nicht generiert werden');
						}
					}}><Link /> Generieren</Button
				>
			{:else}
				<div class="flex gap-4">
					<Input value={inviteUrl} readonly />
					<Button
						onclick={async () => {
							try {
								await navigator.clipboard.writeText(inviteText);
								toast.success('Link in die Zwischenablage kopiert');
							} catch (e) {
								toast.error('Link konnte nicht kopiert werden');
							}
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
			<form
				{...editClubDetails.enhance(async ({ submit }) => {
					await submit().updates(
						getClubPageData({ clubId }).withOverride((currentData) => ({
							...currentData,
							qClub: {
								...currentData.qClub,
								name: editClubDetails.fields.name.value() || currentData.qClub.name
							}
						}))
					);
					editDialogOpen = false;
				})}
			>
				<input hidden {...editClubDetails.fields.clubId.as('text')} />
				<Field.Field>
					<Field.FieldLabel for="club-name">Name</Field.FieldLabel>
					<Input id="club-name" {...editClubDetails.fields.name.as('text')} />
					<Field.FieldError issues={editClubDetails.fields.name.issues()} />
				</Field.Field>
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
				<AlertDialog.Action
					onclick={async () => {
						try {
							await deleteClub({ clubId });
							toast.success('Club erfolgreich gelöscht');
							await getClubsPageData().refresh();
							deleteDialogOpen = false;
							goto('/clubs');
						} catch (e) {
							toast.error('Club konnte nicht gelöscht werden');
						}
					}}
					class={buttonVariants({ variant: 'destructive' })}>Löschen</AlertDialog.Action
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
				<AlertDialog.Action
					onclick={async () => {
						try {
							await leaveClub({ clubId });
							toast.success('Club erfolgreich verlassen');
							await getClubsPageData().refresh();
							leaveDialogOpen = false;
							goto('/clubs');
						} catch (e) {
							toast.error('Club konnte nicht verlassen werden');
						}
					}}
					class={buttonVariants({ variant: 'destructive' })}>Verlassen</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/snippet}
