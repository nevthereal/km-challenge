import type { User, Session } from '#lib/auth/index.ts';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
