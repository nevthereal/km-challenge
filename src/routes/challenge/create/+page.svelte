<script lang="ts">
	import FormCell from '$lib/components/FormCell.svelte';
	import { superForm } from 'sveltekit-superforms';
	let { data } = $props();

	const { form, enhance, constraints } = superForm(data.createForm);
</script>

<h1 class="mb-4 text-6xl font-bold">Challenge Erstellen</h1>
<form method="post" use:enhance class="flex max-w-xl flex-col gap-2">
	<FormCell forAttr="name" label="Name">
		<input name="name" class="input input-primary" type="text" bind:value={$form.name} />
	</FormCell>
	<div class="flex gap-4">
		<FormCell forAttr="startsAt" label="Start der Challenge">
			<input
				name="startsAt"
				class="input input-primary"
				type="datetime-local"
				bind:value={$form.startsAt}
			/>
		</FormCell>
		<FormCell forAttr="endsAt" label="Ende der Challenge">
			<input
				name="endsAt"
				class="input input-primary"
				type="datetime-local"
				bind:value={$form.endsAt}
			/>
		</FormCell>
	</div>
</form>
