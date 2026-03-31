<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { ComponentProps } from 'svelte';

	let { ...restProps }: ComponentProps<typeof Separator> = $props();
</script>

<Separator {...restProps} />
