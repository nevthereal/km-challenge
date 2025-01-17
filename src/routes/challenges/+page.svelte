<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { prettyDate } from '$lib/utils';

	let { data } = $props();

	let { challenges } = data;
</script>

<Button href="/challenges/create">Challenge erstellen</Button>

<div class="grid grid-cols-3 gap-4">
	{#each challenges as challenge}
		<a href={`/challenges/${challenge.id}`}>
			<Card.Root>
				<Card.Header>
					<Card.Title>{challenge.name}</Card.Title>
					<Card.Description
						>{prettyDate(new Date(challenge.startsAt))} - {prettyDate(
							new Date(challenge.endsAt)
						)}</Card.Description
					>
				</Card.Header>
				<Card.Footer>
					<!-- <p class="mt-4">
						{challenge} Teilnehmer
					</p> -->
				</Card.Footer>
			</Card.Root>
		</a>
	{/each}
</div>
