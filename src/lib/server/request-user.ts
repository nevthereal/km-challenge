import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import type { User } from '$lib/auth';

type AppUser = User & {
	superUser: boolean;
	completedProfile: boolean;
};

function decorateUser(user: User): AppUser {
	return {
		...user,
		superUser: user.admin || user.role === 'Coach',
		completedProfile: user.role != null && user.gender != null
	};
}

export function getCurrentUser() {
	const { locals } = getRequestEvent();

	return locals.user ? decorateUser(locals.user) : null;
}

export function requireUser() {
	const event = getRequestEvent();
	const user = getCurrentUser();

	if (!user) {
		redirect(302, `/signin?redirect=${event.url.pathname}`);
	}

	return user;
}

export function requireCompletedProfile() {
	const event = getRequestEvent();
	const user = requireUser();

	if (!user.completedProfile) {
		redirect(302, `/profile/edit?redirect=${event.url.pathname}`);
	}

	return user;
}
