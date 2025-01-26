import { generateCode, generateNumber } from '@nevthereal/random-utils';
import { pgTable, text, timestamp, boolean, pgEnum, numeric, date } from 'drizzle-orm/pg-core';

export const challenge = pgTable('challenge', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(6)),
	name: text().notNull(),
	startsAt: timestamp().notNull(),
	endsAt: timestamp().notNull(),
	creatorId: text()
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	clubId: text()
		.references(() => club.id, { onDelete: 'cascade' })
		.notNull()
});

export const discipline = pgTable('discipline', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(10)),
	name: text().notNull(),
	factor: numeric({ scale: 1 }).notNull(),
	challengeId: text().references(() => challenge.id, { onDelete: 'cascade' })
});

export const roles = pgEnum('role', ['Coach', 'U15', 'U17', 'U19']);
export const gender = pgEnum('gender', ['M', 'F']);

export const entry = pgTable('entry', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(16)),
	disciplineId: text()
		.references(() => discipline.id, { onDelete: 'cascade' })
		.notNull(),
	challengeId: text()
		.references(() => challenge.id, { onDelete: 'cascade' })
		.notNull(),
	userId: text()
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	date: date({ mode: 'date' }).notNull(),
	amount: numeric({ scale: 2 }).notNull(),
	createdAt: timestamp()
		.notNull()
		.$defaultFn(() => new Date())
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
	gender: gender(),
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
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text().primaryKey(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
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
	clubId: text()
		.notNull()
		.references(() => club.id, { onDelete: 'cascade' })
});

export const club = pgTable('club', {
	id: text()
		.primaryKey()
		.$defaultFn(() => generateCode(6)),
	name: text().notNull()
});

export const clubAdmin = pgTable('club_admin', {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateCode(20)),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	clubId: text()
		.notNull()
		.references(() => club.id, { onDelete: 'cascade' })
});

export const clubMember = pgTable('club_member', {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateCode(20)),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	clubId: text()
		.notNull()
		.references(() => club.id, { onDelete: 'cascade' })
});

export const challengeMember = pgTable('challenge_member', {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateCode(20)),
	userId: text()
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	challengeId: text()
		.notNull()
		.references(() => challenge.id, { onDelete: 'cascade' })
});
