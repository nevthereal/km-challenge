import { z } from 'zod';
import { roles } from './db/schema';

export const createProjectSchema = z
	.object({
		name: z.string().min(3),
		startsAt: z.date(),
		endsAt: z.date()
	})
	.refine((data) => data.endsAt > data.startsAt, {
		message: 'endsAt must be after startsAt',
		path: ['endsAt']
	});

export const userSetup = z.object({
	username: z.string(),
	role: z.enum(roles.enumValues, { message: 'Kategorie ungültig' })
});
