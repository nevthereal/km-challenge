<script lang="ts">
	import { page } from '$app/state';
	import { joinClubByCode } from '$lib/remote/club.remote';

	await joinClubByCode({ code: page.params.code ?? '' });
</script>

<p class="text-muted-foreground">Trete Club bei...</p>
