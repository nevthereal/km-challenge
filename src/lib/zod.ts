import { z } from 'zod';

export const createProjectSchema = z
	.object({
		name: z.string(),
		startsAt: z.date(),
		endsAt: z.date()
	})
	.refine((data) => data.endsAt > data.startsAt, {
		message: 'endsAt must be after startsAt',
		path: ['endsAt']
	});
