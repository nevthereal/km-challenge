<script lang="ts">
	import type { Snippet } from 'svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	type Props = {
		for?: string;
		children?: Snippet;
	};

	let { for: htmlFor, children }: Props = $props();
</script>

<Label for={htmlFor}>
	{@render children?.()}
</Label>
