<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLegendElement>> = $props();
</script>

<legend
	bind:this={ref}
	data-slot="field-legend"
	class={cn('text-sm font-medium leading-none', className)}
	{...restProps}
>
	{@render children?.()}
</legend>
