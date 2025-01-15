<script lang="ts">
	let { data } = $props();

	const { competition } = data;
</script>

<h1 class="text-3xl">{competition.name}</h1>
