import { redirect } from '@sveltejs/kit';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function prettyDate(date: Date) {
	return Intl.DateTimeFormat('de', { dateStyle: 'long' }).format(date);
}

export function getUser(locals: App.Locals) {
	const { user } = locals;

	if (!user) return redirect(302, '/');

	return user;
}

export function isSuperUser(locals: App.Locals) {
	const user = getUser(locals);

	if (user.admin || user.role === 'Athlet') return true;

	return false;
}
