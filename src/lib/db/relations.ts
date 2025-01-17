import { relations } from 'drizzle-orm';
import { challenge, club, clubAdmin, discipline, entry, inviteCode, user } from './schema';

export const codeRelation = relations(inviteCode, ({ one }) => ({
	challenge: one(challenge, {
		fields: [inviteCode.challengeId],
		references: [challenge.id]
	})
}));

export const userRelation = relations(user, ({ many }) => ({
	participations: many(entry),
	entries: many(entry),
	adminOf: many(clubAdmin)
}));

export const challengeRelation = relations(challenge, ({ many, one }) => ({
	participations: many(entry),
	entries: many(entry),
	codes: many(inviteCode),
	disciplines: many(discipline),
	creator: one(user, {
		fields: [challenge.creatorId],
		references: [user.id]
	}),
	club: one(club, {
		fields: [challenge.clubId],
		references: [club.id]
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

export const clubRelation = relations(club, ({ many }) => ({
	challenges: many(challenge),
	admins: many(clubAdmin)
}));

export const clubAdminRelation = relations(clubAdmin, ({ one }) => ({
	club: one(club, {
		fields: [clubAdmin.clubId],
		references: [club.id]
	}),
	user: one(user, {
		fields: [clubAdmin.userId],
		references: [user.id]
	})
}));
