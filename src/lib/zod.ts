import { z } from 'zod';
import { gender, roles } from './db/schema';

export const createChallenge = z
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
	role: z.enum(roles.enumValues, { message: 'Kategorie ungültig' }),
	gender: z.enum(gender.enumValues, { message: 'Geschlecht ungültig' })
});

export const addDisciplines = z.object({
	discipline: z
		.object({
			name: z.string(),
			multiplier: z
				.number({
					error: (issue) => (issue.input === undefined ? 'This field is required' : 'Not a string')
				})
				.multipleOf(0.1)
		})
		.array()
});

export const newEntry = z.object({
	disciplineId: z.string(),
	amount: z.number().multipleOf(0.01).min(0.01),
	date: z.iso.date()
});

export const editClub = z.object({
	name: z.string().min(5)
});
