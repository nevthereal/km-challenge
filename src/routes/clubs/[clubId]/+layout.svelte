<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	let { children } = $props();
</script>

<nav class="mb-4">
	<a href="/clubs" class="flex items-center gap-2 text-xl font-bold text-muted-foreground"
		><ArrowLeft strokeWidth={3} /> Alle Clubs</a
	>
</nav>
<section>
	{@render children()}
</section>
