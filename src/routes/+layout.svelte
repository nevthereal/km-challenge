<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="mx-8 my-4">
	{@render children()}
</div>
