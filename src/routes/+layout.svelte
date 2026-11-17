<script lang="ts">
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.ts';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { getSessionState } from '#lib/remote/session.remote.ts';
	import { LogOut, User } from '@lucide/svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { authClient } from '#lib/auth/client.ts';
	import { Toaster } from '#lib/components/ui/sonner/index.ts';
	import { resolve } from '$app/paths';
	import { dev } from '$app/env';

	let { children } = $props();

	const sessionState = getSessionState();
	const sessionData = $derived(await sessionState);
	const session = $derived(sessionData.session);
	const user = $derived(sessionData.user);

	async function signOut() {
		await authClient.signOut();
		location.reload();
	}
</script>

<Toaster />
<ModeWatcher defaultMode="system" />
{#if dev}
	<div class="bg-destructive w-full max-w-full p-2 text-center text-lg font-bold">Dev mode</div>
{/if}
<nav class="flex items-center justify-between p-6">
	<div class="flex gap-4">
		<a href={resolve('/')} class="text-4xl font-bold">Start</a>
		<div class="flex">
			<a href={resolve('clubs')} class="my-auto text-lg font-semibold">Clubs</a>
		</div>
	</div>
	{#if !session || !user}
		<Button href={resolve('signin')}>Anmelden</Button>
	{:else}
		<div class="flex gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'default' })}>
					<User /><span class="max-md:hidden">
						{user.name}
					</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading>Profil</DropdownMenu.GroupHeading>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							><a class="w-full" href={resolve('profile')}>Übersicht</a></DropdownMenu.Item
						>
						<DropdownMenu.Item
							><a class="w-full" href={resolve('profile/edit')}>Bearbeiten</a></DropdownMenu.Item
						>
						<Button class="m-2" variant="destructive" onclick={signOut}
							><LogOut /><span>Ausloggen</span></Button
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</nav>
<div class="mx-8 my-4 max-w-full min-w-0 overflow-x-clip">
	{@render children()}
</div>
