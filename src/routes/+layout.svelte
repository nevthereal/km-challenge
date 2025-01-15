<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/challenges">Challenges</a>
</nav>
<div class="mx-8 my-4">
	{@render children()}
</div>
