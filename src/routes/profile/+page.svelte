<script lang="ts">
	import NiceList from '$lib/components/NiceList.svelte';
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import { prettyDate } from '$lib/utils';

	let { data } = $props();

	const { user } = data;

	const listItems: ListItems = [
		{
			name: 'Name',
			content: user.name
		},
		{
			name: 'Beigetreten',
			content: prettyDate(user.createdAt)
		},
		{
			name: 'Email',
			content: user.email
		}
	];
</script>

<h1 class="h1">Übersicht</h1>
<NiceList className="text-lg" {listItems} />
