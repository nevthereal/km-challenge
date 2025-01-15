import { generateCode, generateNumber } from '@nevthereal/random-utils';
import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const competitionTable = pgTable('competition', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(6)),
	name: text().notNull(),
	startsAt: timestamp().notNull(),
	endsAt: timestamp().notNull(),
	creatorId: text()
		.references(() => userTable.id)
		.notNull()
});

export const disciplineTable = pgTable('discipline', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(10)),
	name: text().notNull(),
	factor: integer().notNull(),
	competitionId: text().references(() => competitionTable.id)
});

export const roles = pgEnum('role', ['Coach', 'Athlet']);

export const userTable = pgTable('user', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	username: text().notNull().unique(),
	admin: boolean().default(false),
	role: roles().notNull().default('Athlet'),
	googleId: text().notNull().unique()
});

export const entryTable = pgTable('entry', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(16)),
	disciplineId: text()
		.references(() => disciplineTable.id)
		.notNull(),
	competitionId: text()
		.references(() => competitionTable.id)
		.notNull(),
	userId: text()
		.references(() => userTable.id)
		.notNull(),
	createdAt: timestamp().notNull()
});

export const sessionTable = pgTable('session', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp({
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const codeTable = pgTable('code', {
	code: text()
		.primaryKey()
		.$defaultFn(() => generateNumber(6)),
	competitionId: text()
		.notNull()
		.references(() => competitionTable.id)
});

export const codeRelations = relations(codeTable, ({ one }) => ({
	competition: one(competitionTable, {
		fields: [codeTable.competitionId],
		references: [competitionTable.id]
	})
}));

export const userRelations = relations(userTable, ({ many }) => ({
	participations: many(entryTable)
}));

export const competitionRelations = relations(competitionTable, ({ many }) => ({
	participations: many(entryTable),
	entries: many(entryTable)
}));

export const participationRelations = relations(entryTable, ({ one }) => ({
	user: one(userTable, {
		fields: [entryTable.userId],
		references: [userTable.id]
	}),
	competition: one(competitionTable, {
		fields: [entryTable.competitionId],
		references: [competitionTable.id]
	})
}));
