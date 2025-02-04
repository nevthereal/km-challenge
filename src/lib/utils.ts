import { redirect } from '@sveltejs/kit';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function prettyDate(date: Date) {
	return Intl.DateTimeFormat('de', { dateStyle: 'long' }).format(date);
}

export function getUser({ locals, redirectUrl }: { locals: App.Locals; redirectUrl: string }) {
	const { user } = locals;

	if (!user) return redirect(302, `/signin?redirect=${redirectUrl}`);

	const superUser = user.admin || user.role === 'Coach';
	const completedProfile = user.role != null && user.gender != null;

	return { ...user, superUser, completedProfile };
}

export type FullUser = ReturnType<typeof getUser>;
