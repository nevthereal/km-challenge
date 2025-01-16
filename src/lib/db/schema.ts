import { generateCode, generateNumber } from '@nevthereal/random-utils';
import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean, pgEnum, date } from 'drizzle-orm/pg-core';

export const competition = pgTable('competition', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(6)),
	name: text().notNull(),
	startsAt: date().notNull(),
	endsAt: date().notNull(),
	creatorId: text()
		.references(() => user.id)
		.notNull()
});

export const discipline = pgTable('discipline', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(10)),
	name: text().notNull(),
	factor: integer().notNull(),
	competitionId: text().references(() => competition.id)
});

export const roles = pgEnum('role', ['Coach', 'U15', 'U17', 'U19']);

export const entry = pgTable('entry', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(16)),
	disciplineId: text()
		.references(() => discipline.id)
		.notNull(),
	competitionId: text()
		.references(() => competition.id)
		.notNull(),
	userId: text()
		.references(() => user.id)
		.notNull(),
	createdAt: timestamp().notNull()
});

export const user = pgTable('user', {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
	role: roles(),
	admin: boolean().default(false)
});

export const session = pgTable('session', {
	id: text().primaryKey(),
	expiresAt: timestamp().notNull(),
	token: text().notNull().unique(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text()
		.notNull()
		.references(() => user.id)
});

export const account = pgTable('account', {
	id: text().primaryKey(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text()
		.notNull()
		.references(() => user.id),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp(),
	refreshTokenExpiresAt: timestamp(),
	scope: text(),
	password: text(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull()
});

export const verification = pgTable('verification', {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp().notNull(),
	createdAt: timestamp(),
	updatedAt: timestamp()
});

export const inviteCode = pgTable('code', {
	code: text()
		.primaryKey()
		.$defaultFn(() => generateNumber(6)),
	competitionId: text()
		.notNull()
		.references(() => competition.id)
});

// RELATIONS
export const codeRelation = relations(inviteCode, ({ one }) => ({
	competition: one(competition, {
		fields: [inviteCode.competitionId],
		references: [competition.id]
	})
}));

export const userRelation = relations(user, ({ many }) => ({
	participations: many(entry),
	entries: many(entry)
}));

export const competitionRelation = relations(competition, ({ many, one }) => ({
	participations: many(entry),
	entries: many(entry),
	codes: many(inviteCode),
	disciplines: many(discipline),
	creator: one(user, {
		fields: [competition.creatorId],
		references: [user.id]
	})
}));

export const entryRelation = relations(entry, ({ one }) => ({
	user: one(user, {
		fields: [entry.userId],
		references: [user.id]
	}),
	competition: one(competition, {
		fields: [entry.competitionId],
		references: [competition.id]
	}),
	discipline: one(discipline, {
		fields: [entry.disciplineId],
		references: [discipline.id]
	})
}));

export const disciplineRelation = relations(discipline, ({ one, many }) => ({
	competition: one(competition, {
		fields: [discipline.competitionId],
		references: [competition.id]
	}),
	entries: many(entry)
}));
