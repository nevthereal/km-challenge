<script lang="ts">
	import NiceList from '$lib/components/NiceList.svelte';
	import type { ListItems } from '$lib/components/NiceList.svelte';
	import { getProfile } from '$lib/remote/profile.remote';
	import { prettyDate } from '$lib/utils';

	const profile = getProfile();
	const data = await profile;
	const listItems = [
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
	] satisfies ListItems;
</script>

<h1 class="h1">Übersicht</h1>
<NiceList className="text-lg" {listItems} />
