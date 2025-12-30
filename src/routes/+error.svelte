<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Home } from '@lucide/svelte';
</script>

<main class="text-center">
	<h1 class="h1 mt-16">Da ist etwas schiefgelaufen</h1>
	<h2 class="h2 text-destructive mt-4">{page.status}: {page.error?.message}</h2>
	<Button href="/" class="mt-2"><Home /> Zurück zur Startseite</Button>
</main>
