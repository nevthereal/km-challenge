<script lang="ts">
	import { resolve } from '$app/paths';
	let { children } = $props();
</script>

<div class="flex max-md:flex-col">
	<div class="bg-muted flex gap-6 rounded-md p-4 md:flex-col md:gap-4 md:p-8">
		<h1 class="text-4xl font-black max-md:my-auto">Profil</h1>
		<ul class="flex flex-col gap-2">
			<li>
				<a class="text-muted-foreground text-lg font-semibold" href={resolve('/profile')}
					>Übersicht</a
				>
			</li>
			<li>
				<a class="text-muted-foreground text-lg font-semibold" href={resolve('/profile/edit')}
					>Bearbeiten</a
				>
			</li>
		</ul>
	</div>
	<section class="p-6">
		{@render children()}
	</section>
</div>
