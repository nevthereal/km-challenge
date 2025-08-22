<script lang="ts">
	// import DatePicker from '$lib/components/DatePicker.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Card from '$lib/components/ui/card';
	import { PlusCircle } from 'lucide-svelte';
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-center">Challenge erstellen</Card.Title>
			</Card.Header>
			<Card.Content class="flex justify-center">
				<PlusCircle size={36} />
			</Card.Content>
		</Card.Root>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<!-- <form
				method="post"
				action="?/createChallenge"
				use:createEnhance
				class="flex max-w-xl flex-col gap-2"
			>
				<Form.Field form={createForm} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$createFormFields.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={createForm} name="startsAt" class="flex flex-col">
					<Form.Control>
						{#snippet children()}
							<Form.Label>Dauer der Challenge</Form.Label>
							<Form.Description
								>Bitte Enddatum im Stil "bis", anstatt "bis und mit" wählen, weil die Endzeit auf
								00:00 gesetzt wird.</Form.Description
							>
							<DatePicker
								startName="startsAt"
								endName="endsAt"
								bind:startValue={$createFormFields.startsAt}
								bind:endValue={$createFormFields.endsAt}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Erstellen</Form.Button>
			</form> -->
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
