<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { LogOut, User } from 'lucide-svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { authClient } from '$lib/auth/client';
	import { Toaster } from '$lib/components/ui/sonner';
	import { page } from '$app/state';
	import { dev } from '$app/environment';

	let { children, data } = $props();

	let { session } = data;
</script>

<Toaster />
<ModeWatcher defaultMode="system" />
{#if dev}
	<div class="w-screen bg-destructive p-2 text-center text-lg font-bold">Dev mode</div>
{/if}
<nav class="flex items-center justify-between p-6">
	<div class="flex gap-4">
		<a href="/" class="text-4xl font-bold">Start</a>
		<div class="flex">
			<a href="/clubs" class="my-auto text-lg font-semibold">Clubs</a>
		</div>
	</div>
	{#if !session}
		<Button href="/signin">Anmelden</Button>
	{:else}
		<div class="flex gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'default' })}>
					<User /><span class="max-md:hidden">
						{session.user.name}
					</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.GroupHeading>Profil</DropdownMenu.GroupHeading>
						<DropdownMenu.Separator />
						<DropdownMenu.Item><a class="w-full" href="/profile">Übersicht</a></DropdownMenu.Item>
						<DropdownMenu.Item
							><a class="w-full" href="/profile/edit">Bearbeiten</a></DropdownMenu.Item
						>
						<Button
							class="m-2"
							variant="destructive"
							onclick={async () => {
								await authClient(page.url.origin).signOut();
								location.reload();
							}}
							><LogOut /><span> Ausloggen </span>
						</Button>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</nav>
<div class="mx-8 my-4">
	{@render children()}
</div>
