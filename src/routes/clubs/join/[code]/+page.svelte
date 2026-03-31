<script lang="ts">
	import { page } from '$app/state';
	import { acceptInvite } from '$lib/remote/clubs.remote';

	const invite = acceptInvite(page.params.code ?? '');
	await invite;
</script>

<p class="text-muted-foreground font-mono italic">Weiterleitung...</p>
