<script lang="ts">
	import { PlusCircle } from '@lucide/svelte';
	import { createEntryForm, getChallengeOverview, getChallengePageContext, getHomeDashboard, getLeaderboard, getUserChallengeActivity } from '$lib/remote/challenges.remote';
	import { challenge as challengeTable, discipline as disciplineTable } from '$lib/db/schema';
	import { Button, buttonVariants } from './ui/button';
	import * as Dialog from './ui/dialog';
	import * as Field from './ui/field';
	import { Input } from './ui/input';
	import { canAddEntries, cn } from '$lib/utils';

	type ChallengeLike = typeof challengeTable.$inferSelect & {
		members?: unknown[];
	};

	interface Props {
		disciplines: Array<typeof disciplineTable.$inferSelect>;
		challenge: ChallengeLike;
		classNames?: string;
	}

	let { disciplines, challenge, classNames }: Props = $props();

	let dialogOpen = $state(false);
	let primedChallengeId = $state<string | null>(null);

	const entryForm = $derived(createEntryForm.for(challenge.id));

	function toDateInputValue(date: Date) {
		const offset = date.getTimezoneOffset() * 60_000;
		return new Date(date.getTime() - offset).toISOString().slice(0, 10);
	}

	function getDefaultDate() {
		const today = new Date();
		const startsAt = new Date(challenge.startsAt);
		const endsAt = new Date(challenge.endsAt);

		if (today < startsAt) return toDateInputValue(startsAt);
		if (today > endsAt) return toDateInputValue(endsAt);
		return toDateInputValue(today);
	}

	function resetDefaults() {
		entryForm.fields.set({
			challengeId: challenge.id,
			disciplineId: disciplines[0]?.id ?? '',
			date: getDefaultDate()
		});
	}

	$effect(() => {
		if (primedChallengeId !== challenge.id) {
			resetDefaults();
			primedChallengeId = challenge.id;
		}
	});

	const active = $derived(canAddEntries(challenge));
	const leaderboardLimit = $derived(
		Array.isArray(challenge.members) && challenge.members.length > 0 ? challenge.members.length : 5
	);

	async function onsubmit({ form, submit }: { form: HTMLFormElement; submit: any }) {
		await submit().updates(
			getHomeDashboard(),
			getChallengePageContext({ clubId: challenge.clubId, challengeId: challenge.id }),
			getChallengeOverview({ clubId: challenge.clubId, challengeId: challenge.id }),
			getUserChallengeActivity({ clubId: challenge.clubId, challengeId: challenge.id }),
			getLeaderboard({ challengeId: challenge.id, limit: 5 }),
			getLeaderboard({ challengeId: challenge.id, limit: leaderboardLimit })
		);

		if ((entryForm.fields.allIssues()?.length ?? 0) === 0) {
			dialogOpen = false;
			form.reset();
			resetDefaults();
		}
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		disabled={!active}
		class={cn(
			buttonVariants({ variant: active ? 'default' : 'secondary' }),
			'disabled:cursor-not-allowed max-md:my-auto',
			classNames
		)}
	>
		<PlusCircle />
		{active ? 'Neuer Eintrag' : 'Challenge Inaktiv'}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="h2">Neuer Eintrag</Dialog.Title>
		</Dialog.Header>

		<form {...entryForm.enhance(onsubmit)} class="space-y-4 text-left">
			<input hidden name="challengeId" value={entryForm.fields.challengeId.value() ?? challenge.id} />

			<p class="text-muted-foreground text-sm text-balance max-md:text-center">
				Bitte Kilometer roh eintragen, die Punkte werden später verrechnet.
			</p>

			<div class="flex gap-4 max-sm:flex-col">
				<Field.Field class="w-24 sm:w-32">
					<Field.Label for="entry-amount-{challenge.id}">Kilometer</Field.Label>
					<Input
						id="entry-amount-{challenge.id}"
						step="0.01"
						{...entryForm.fields.amount.as('number')}
					/>
					{#each entryForm.fields.amount.issues() as issue, index (`entry-amount-${challenge.id}-${index}-${issue.message}`)}
						<Field.Error>{issue.message}</Field.Error>
					{/each}
				</Field.Field>

				<Field.Field class="flex-1">
					<Field.Label for="entry-discipline-{challenge.id}">Disziplin</Field.Label>
					<select
						id="entry-discipline-{challenge.id}"
						class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
						{...entryForm.fields.disciplineId.as('select')}
					>
						<option value="" disabled={disciplines.length > 0}>Disziplin wählen</option>
						{#each disciplines as discipline (discipline.id)}
							<option value={discipline.id}>{discipline.name} (x{discipline.factor})</option>
						{/each}
					</select>
					{#each entryForm.fields.disciplineId.issues() as issue, index (`entry-discipline-${challenge.id}-${index}-${issue.message}`)}
						<Field.Error>{issue.message}</Field.Error>
					{/each}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.Label for="entry-date-{challenge.id}">Datum der Aktivität</Field.Label>
				<Input
					id="entry-date-{challenge.id}"
					min={toDateInputValue(new Date(challenge.startsAt))}
					max={toDateInputValue(new Date(challenge.endsAt))}
					{...entryForm.fields.date.as('date')}
				/>
				{#each entryForm.fields.date.issues() as issue, index (`entry-date-${challenge.id}-${index}-${issue.message}`)}
					<Field.Error>{issue.message}</Field.Error>
				{/each}
			</Field.Field>

			<Button type="submit" disabled={disciplines.length === 0}>
				Hinzufügen
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
