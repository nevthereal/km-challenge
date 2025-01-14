import { z } from 'zod';

export const createProjectSchema = z.object({
	name: z.string(),
	startsAt: z.date(),
	endsAt: z.date()
});
