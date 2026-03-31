<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'vertical',
		children,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLDivElement> & {
			orientation?: 'horizontal' | 'vertical';
		}
	> = $props();
</script>

<div
	bind:this={ref}
	data-slot="field"
	data-orientation={orientation}
	class={cn(
		'flex gap-2',
		orientation === 'horizontal' ? 'items-center' : 'flex-col',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
