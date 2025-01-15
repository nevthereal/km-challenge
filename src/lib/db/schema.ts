import { generateCode, generateNumber } from '@nevthereal/random-utils';
import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const competition = pgTable('competition', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(6)),
	name: text().notNull(),
	startsAt: timestamp().notNull(),
	endsAt: timestamp().notNull(),
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

export const roles = pgEnum('role', ['Coach', 'Athlet']);

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
	role: roles().notNull().default('Athlet'),
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

export const code = pgTable('code', {
	code: text()
		.primaryKey()
		.$defaultFn(() => generateNumber(6)),
	competitionId: text()
		.notNull()
		.references(() => competition.id)
});

export const codeRelations = relations(code, ({ one }) => ({
	competition: one(competition, {
		fields: [code.competitionId],
		references: [competition.id]
	})
}));

export const userRelations = relations(user, ({ many }) => ({
	participations: many(entry)
}));

export const competitionRelations = relations(competition, ({ many }) => ({
	participations: many(entry),
	entries: many(entry)
}));

export const participationRelations = relations(entry, ({ one }) => ({
	user: one(user, {
		fields: [entry.userId],
		references: [user.id]
	}),
	competition: one(competition, {
		fields: [entry.competitionId],
		references: [competition.id]
	})
}));
