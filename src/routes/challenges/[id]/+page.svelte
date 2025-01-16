<script lang="ts">
	let { data } = $props();

	const { challenge } = data;
</script>

<h1 class="text-3xl">{challenge.name}</h1>
