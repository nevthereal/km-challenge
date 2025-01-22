<script lang="ts">
	let { data } = $props();

	const { user } = data;
</script>

<h1 class="h1">Übersicht</h1>
<ul class="flex flex-col gap-1 md:text-lg">
	<li>
		<span class="font-medium">Name:</span>
		<span class="text-muted-foreground">{user.name}</span>
	</li>
	<li>
		<span class="font-medium">Beigetreten:</span>
		<span class="text-muted-foreground"
			>{Intl.DateTimeFormat('de', { dateStyle: 'long' }).format(user.createdAt)}</span
		>
	</li>
	<li class="flex items-center gap-2">
		<span class="font-medium">Email:</span>
		<span class="text-muted-foreground">{user.email}</span>
	</li>
</ul>
