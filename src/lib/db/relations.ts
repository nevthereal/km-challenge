import { relations } from 'drizzle-orm';
import {
	challenge,
	club,
	clubAdmin,
	clubMember,
	discipline,
	entry,
	inviteCode,
	user,
	challengeMember
} from './schema';

export const codeRelation = relations(inviteCode, ({ one }) => ({
	club: one(club, {
		fields: [inviteCode.clubId],
		references: [club.id]
	})
}));

export const userRelation = relations(user, ({ many }) => ({
	participations: many(entry),
	entries: many(entry),
	adminOf: many(clubAdmin),
	memberOf: many(clubMember),
	challenges: many(challengeMember)
}));

export const challengeRelation = relations(challenge, ({ many, one }) => ({
	entries: many(entry),
	disciplines: many(discipline),
	members: many(challengeMember),
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
	admins: many(clubAdmin),
	codes: many(inviteCode),
	members: many(clubMember)
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

export const clubMemberRelation = relations(clubMember, ({ one }) => ({
	club: one(club, {
		fields: [clubMember.clubId],
		references: [club.id]
	}),
	user: one(user, {
		fields: [clubMember.userId],
		references: [user.id]
	})
}));

export const challengeMemberRelation = relations(challengeMember, ({ one }) => ({
	challenge: one(challenge, {
		fields: [challengeMember.challengeId],
		references: [challenge.id]
	}),
	user: one(user, {
		fields: [challengeMember.userId],
		references: [user.id]
	})
}));
