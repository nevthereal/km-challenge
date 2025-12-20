import { z } from 'zod';
import { gender, roles } from './db/schema';

export const newChallenge = z
	.object({
		name: z.string().min(3),
		startsAt: z.iso.date(),
		endsAt: z.iso.date(),
		clubId: z.string()
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
			multiplier: z.number().multipleOf(0.1)
		})
		.array(),
	challengeId: z.string()
});

export const newEntry = z.object({
	disciplineId: z.string(),
	amount: z.number().multipleOf(0.01).min(0.01),
	date: z.iso.date()
}); // done

export const editClub = z.object({
	name: z.string().min(5),
	id: z.string()
});
