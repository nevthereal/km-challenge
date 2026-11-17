import { z } from 'zod';
import { gender, roles } from './db/schema';

export const createChallenge = z
	.object({
		name: z.string().min(3),
		startsAt: z.iso.date(),
		endsAt: z.iso.date()
	})
	.refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
		message: 'endsAt must be after startsAt',
		path: ['endsAt']
	});

export const userSetup = z.object({
	username: z.string().trim().min(1),
	role: z.enum(roles.enumValues, { message: 'Kategorie ungültig' }),
	gender: z.enum(gender.enumValues, { message: 'Geschlecht ungültig' })
});

export const addDisciplines = z.object({
	discipline: z
		.object({
			name: z.string().trim().min(1),
			multiplier: z
				.number({
					error: (issue) => (issue.input === undefined ? 'This field is required' : 'Not a string')
				})
				.positive()
				.multipleOf(0.1)
		})
		.array()
		.min(1)
});

export const newEntry = z.object({
	disciplineId: z.string(),
	amount: z.number().multipleOf(0.01).min(0.01),
	date: z.iso.date()
});

export const editClub = z.object({
	name: z.string().min(5)
});

export const createClub = z.object({
	name: z.string().min(5)
});

export const joinClubByCode = z.object({
	code: z.string().min(6)
});

export const entrySubmission = newEntry.extend({
	challengeId: z.string().min(1)
});
