import { db, checkAdmin } from '$lib/db';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { club, challenge, inviteCode, clubMember } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { getUser } from '$lib/remote/auth.remote';
import { createChallenge, editClub } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = await getUser();

	const createForm = await superValidate(zod(createChallenge));

	const editClubForm = await superValidate(zod(editClub), {});

	return { createForm, user, editClubForm };
};

export const actions: Actions = {
	createChallenge: async ({ locals, request, url, params }) => {},
	deleteClub: async ({ locals, url, params }) => {},
	leave: async ({ locals, url, params }) => {},
	edit: async ({ locals, url, params, request }) => {}
};
