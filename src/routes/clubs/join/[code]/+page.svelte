<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { joinClubByCode } from '$lib/remote/club.remote';
	import { onMount } from 'svelte';

	let joinError = $state<string | null>(null);

	onMount(async () => {
		try {
			const code = page.params.code;
			if (!code) throw new Error('No code provided');
			const { clubId } = await joinClubByCode({ code });
			await goto(`/clubs/${clubId}`);
		} catch {
			joinError = 'Club-Beitritt fehlgeschlagen. Bitte prüfe den Einladungslink.';
		}
	});
</script>

{#if joinError}
	<p class="text-destructive">{joinError}</p>
{:else}
	<p class="text-muted-foreground">Trete Club bei...</p>
{/if}
