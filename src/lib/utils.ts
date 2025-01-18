import { redirect } from '@sveltejs/kit';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function prettyDate(date: Date) {
	return Intl.DateTimeFormat('de', { dateStyle: 'long' }).format(date);
}

export function getUser(locals: App.Locals, redirectUrl: string) {
	const { user } = locals;

	if (!user) return redirect(302, `/profile/signin?redirect=${redirectUrl}`);

	return user;
}

export function isSuperUser(locals: App.Locals, redirectUrl: string) {
	const user = getUser(locals, redirectUrl);

	if (user.admin || user.role === 'Coach') return true;

	return false;
}
