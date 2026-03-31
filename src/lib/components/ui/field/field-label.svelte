<script lang="ts">
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let { class: className, ...restProps }: ComponentProps<typeof Label> = $props();
</script>

<Label class={cn('min-w-0', className)} {...restProps} />
