import { getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import type { User } from '#lib/auth/index.ts';

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

export function requireUser(returnTo = '/profile') {
	const user = getCurrentUser();

	if (!user) {
		redirect(302, `/signin?redirect=${encodeURIComponent(returnTo)}`);
	}

	return user;
}

export function requireCompletedProfile(returnTo = '/clubs') {
	const user = requireUser(returnTo);

	if (!user.completedProfile) {
		redirect(302, `/profile/edit?redirect=${encodeURIComponent(returnTo)}`);
	}

	return user;
}

// Commands cannot redirect; report authentication failures as HTTP errors.
export function requireCommandUser() {
	const user = getCurrentUser();
	if (!user) error(401, 'Bitte zuerst anmelden');
	if (!user.completedProfile) error(403, 'Bitte zuerst das Profil vervollständigen');
	return user;
}
