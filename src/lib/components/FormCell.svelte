<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, label, forAttr }: { children: Snippet; label: string; forAttr: string } =
		$props();
</script>

<div class="flex flex-col gap-1">
	<label class="text-sm" for={forAttr}>{label}</label>
	<div class="flex gap-2">
		{@render children()}
	</div>
</div>
