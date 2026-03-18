<script lang="ts">
	import NiceList from '$lib/components/NiceList.svelte';
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import { prettyDate } from '$lib/utils';
	import { getProfileData } from '$lib/remote/profile.remote';

	const { user } = await getProfileData();

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
