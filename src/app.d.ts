import type { User } from '$lib/server/auth';
import type { Session } from '$lib/server/auth';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
