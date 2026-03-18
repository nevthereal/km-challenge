<script lang="ts">
	import { ensureClubsAccess } from '$lib/remote/club.remote';

	let { children } = $props();

	await ensureClubsAccess();
</script>

{@render children()}
