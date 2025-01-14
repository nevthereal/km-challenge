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

export const user = pgTable('user', {
	id: text()
		.$defaultFn(() => crypto.randomUUID())
		.primaryKey(),
	username: text().notNull().unique(),
	admin: boolean().default(false),
	role: roles().notNull().default('Athlet')
});

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
	participations: many(entry)
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
