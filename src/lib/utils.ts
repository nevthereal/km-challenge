import { redirect } from '@sveltejs/kit';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function checkUser(locals: App.Locals) {
	const { user } = locals;
	if (!user) return redirect(302, '/');
	return user;
}
