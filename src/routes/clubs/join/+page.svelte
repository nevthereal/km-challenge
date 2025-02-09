<script lang="ts">
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'bits-ui';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';

	let { data } = $props();

	const form = superForm(data.form);

	const { form: formFields, enhance, submit } = form;

	$effect(() => {
		if ($formFields.code.length === 6) {
			submit();
		}
	});
</script>

<main class="flex flex-col items-center">
	<h1 class="h1 mb-4">Club beitreten</h1>
	<form method="POST" class="flex flex-col items-center space-y-6" use:enhance>
		<Form.Field {form} name="code">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Einladungscode</Form.Label>
					<InputOTP.Root
						{...props}
						class="mt-6"
						bind:value={$formFields.code}
						maxlength={6}
						pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
					>
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells as cell}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				{/snippet}
			</Form.Control>
		</Form.Field>
	</form>
</main>
