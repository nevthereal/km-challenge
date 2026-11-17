<script lang="ts">
	import NiceList from '#lib/components/NiceList.svelte';
	import type { ListItems } from '#lib/components/NiceList.svelte';
	import { getProfile } from '#lib/remote/profile.remote.ts';
	import { prettyDate } from '#lib/utils.ts';

	const profile = getProfile();
	const data = $derived(await profile);
	const listItems = $derived([
		{
			name: 'Name',
			content: data.user.name
		},
		{
			name: 'Beigetreten',
			content: prettyDate(data.user.createdAt)
		},
		{
			name: 'Email',
			content: data.user.email
		}
	] satisfies ListItems);
</script>

<h1 class="h1">Übersicht</h1>
<NiceList className="text-lg" {listItems} />
