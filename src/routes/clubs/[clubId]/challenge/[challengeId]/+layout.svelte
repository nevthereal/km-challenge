<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, LogIn, LogOut, Trash2 } from 'lucide-svelte';
	import ClubAdmin from '$lib/components/ClubAdmin.svelte';
	import { cn, isActive, prettyDate } from '$lib/utils';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, children } = $props();

	let deleteDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);

	const { challenge, currentUserChallenge, clubAdmin: isAdmin, challengePath } = $derived(data);

	const paths = [
		{
			name: 'Rangliste',
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
		href={`/clubs/${challenge.clubId}`}
		class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Zum Club</a
	>
</nav>
<div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
	<div>
		<h1 class="h1 mb-2">{challenge.name}</h1>
		<p class={cn(active && 'text-green-500')}>
			{prettyDate(challenge.startsAt)} - {prettyDate(challenge.endsAt)}
		</p>
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
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								form="deleteForm"
								class={buttonVariants({ variant: 'destructive' })}>Continue</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</ClubAdmin>
			{#if currentUserChallenge}
				<AlertDialog.Root bind:open={leaveDialogOpen}>
					<AlertDialog.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}>
						<LogOut />Verlassen
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Challenge "{challenge.name}" verlassen?</AlertDialog.Title>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
							<AlertDialog.Action
								form="leaveForm"
								class={buttonVariants({ variant: 'destructive' })}>Verlassen</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{:else}
				<Button
					onclick={async () => {
						await fetch(`/api/join-challenge?id=${challenge.id}`, {
							method: 'post'
						});
						location.reload();
					}}><LogIn />Beitreten</Button
				>
			{/if}
		</div>
	</div>
</div>

{#if !currentUserChallenge}
	<p class="text-muted-foreground">Du bist kein Mitglied dieser Challenge.</p>
{:else}
	<nav class="my-2 overflow-x-scroll border-t-2">
		<ul class="flex gap-1 whitespace-nowrap">
			{#each paths as path}
				<a
					class={cn(
						'p-2 font-bold',
						page.url.pathname === `${challengePath}${path.href}` && 'rounded-b-md bg-muted'
					)}
					href={`${challengePath}${path.href}`}>{path.name}</a
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
	action={`${challengePath}/?/deleteChallenge`}
	use:enhance
	method="post"
></form>
<form id="leaveForm" action={`${challengePath}/?/leave`} method="post" use:enhance hidden></form>
