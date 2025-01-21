<script lang="ts">
	let { children } = $props();
</script>

<div class="flex">
	<div class="flex h-64 flex-col gap-4 rounded-md bg-muted py-4 pl-4 pr-16">
		<h1 class="text-4xl font-black">Profil</h1>
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
