<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { createClub } from '$lib/remote/clubs.remote';
</script>

<h1 class="h1">Club Erstellen</h1>
<form {...createClub} class="max-w-sm">
	<Label>Name</Label>
	<Input name="name" />
	<Button type="submit">Erstellen</Button>
</form>
