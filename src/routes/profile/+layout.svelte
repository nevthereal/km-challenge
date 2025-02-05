<script lang="ts">
	let { children } = $props();
</script>

<div class="flex max-md:flex-col">
	<div class="flex gap-6 rounded-md bg-muted p-4 md:flex-col md:gap-4 md:p-8">
		<h1 class="text-4xl font-black max-md:my-auto">Profil</h1>
		<ul class="flex flex-col gap-2">
			<li><a class="text-lg font-semibold text-muted-foreground" href="/profile">Übersicht</a></li>
			<li>
				<a class="text-lg font-semibold text-muted-foreground" href="/profile/edit">Bearbeiten</a>
			</li>
		</ul>
	</div>
	<section class="p-6">
		{@render children()}
	</section>
</div>
