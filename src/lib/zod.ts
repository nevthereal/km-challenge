import { z } from 'zod';
import { gender, roles } from './db/schema';

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
	role: z.enum(roles.enumValues, { message: 'Kategorie ungültig' }),
	gender: z.enum(gender.enumValues, { message: 'Geschlecht ungültig' })
});

export const addDisciplines = z.object({
	discipline: z
		.object({
			name: z.string(),
			multiplier: z
				.number({
					required_error: 'Der Multiplikator fehlt',
					invalid_type_error: 'Der Multiplikator muss eine Zahl sein'
				})
				.step(0.1)
		})
		.array()
});

export const newEntry = z.object({
	disciplineId: z.string(),
	amount: z.number().step(0.01).min(0.01),
	date: z.string().date()
});

export const editEntry = z.object({
	disciplineId: z.string(),
	amount: z.number().step(0.01).min(0.01),
	date: z.string().date(),
	entryId: z.string()
});
