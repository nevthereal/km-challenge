import { relations } from 'drizzle-orm';
import { challenge, discipline, entry, inviteCode, user } from './schema';

export const codeRelation = relations(inviteCode, ({ one }) => ({
	challenge: one(challenge, {
		fields: [inviteCode.challengeId],
		references: [challenge.id]
	})
}));

export const userRelation = relations(user, ({ many }) => ({
	participations: many(entry),
	entries: many(entry)
}));

export const challengeRelation = relations(challenge, ({ many, one }) => ({
	participations: many(entry),
	entries: many(entry),
	codes: many(inviteCode),
	disciplines: many(discipline),
	creator: one(user, {
		fields: [challenge.creatorId],
		references: [user.id]
	})
}));

export const entryRelation = relations(entry, ({ one }) => ({
	user: one(user, {
		fields: [entry.userId],
		references: [user.id]
	}),
	challenge: one(challenge, {
		fields: [entry.challengeId],
		references: [challenge.id]
	}),
	discipline: one(discipline, {
		fields: [entry.disciplineId],
		references: [discipline.id]
	})
}));

export const disciplineRelation = relations(discipline, ({ one, many }) => ({
	challenge: one(challenge, {
		fields: [discipline.challengeId],
		references: [challenge.id]
	}),
	entries: many(entry)
}));
