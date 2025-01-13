import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

const UUID = text()
	.$defaultFn(() => crypto.randomUUID())
	.primaryKey();

export const competition = pgTable('competition', {
	id: UUID,
	name: text().notNull(),
	startsAt: timestamp().notNull(),
	endsAt: timestamp().notNull(),
	creatorId: text().references(() => user.id)
});

export const discipline = pgTable('discipline', {
	id: UUID,
	name: text().notNull(),
	factor: integer().notNull(),
	competitionId: text().references(() => competition.id)
});

export const user = pgTable('user', {
	id: UUID,
	username: text().notNull().unique(),
	admin: boolean().default(false)
});

export const entry = pgTable('entry', {
	id: UUID,
	disciplineId: text()
		.references(() => discipline.id)
		.notNull(),
	competitionId: text()
		.references(() => competition.id)
		.notNull(),
	userId: text()
		.references(() => user.id)
		.notNull()
});

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
