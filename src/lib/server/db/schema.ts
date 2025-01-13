import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

const UUID = text()
	.$defaultFn(() => crypto.randomUUID())
	.primaryKey();

export const wettbewerb = pgTable('wettbewerb', {
	id: UUID,
	name: text().notNull(),
	startsAt: timestamp().notNull(),
	endsAt: timestamp().notNull(),
	creatorId: text().references(() => user.id)
});

export const disziplin = pgTable('disziplin', {
	id: UUID,
	name: text().notNull(),
	faktor: integer().notNull(),
	wettbewerbId: text().references(() => wettbewerb.id)
});

export const user = pgTable('user', {
	id: UUID,
	username: text().notNull().unique(),
	admin: boolean().default(false)
});

export const entry = pgTable('entry', {
	id: UUID,
	disziplinId: text()
		.references(() => disziplin.id)
		.notNull(),
	wettbewerbId: text()
		.references(() => wettbewerb.id)
		.notNull(),
	userId: text()
		.references(() => user.id)
		.notNull()
});

export const wettbewerbRel = relations(wettbewerb, ({ many, one }) => ({
	teilnehmer: many(user),
	diszipline: many(disziplin),
	entries: many(entry)
}));

export const userRel = relations(user, ({ many }) => ({
	entries: many(entry),
	wettbewerbe: many(wettbewerb)
}));
