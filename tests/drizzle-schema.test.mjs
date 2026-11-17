import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getColumns } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema.ts';

// The Drizzle upgrade moves casing configuration from the client to table creation.
// Verify every existing column name without connecting to or changing a database.
for (const name of [
	'challenge',
	'discipline',
	'entry',
	'user',
	'session',
	'account',
	'verification',
	'inviteCode',
	'club',
	'clubAdmin',
	'clubMember',
	'challengeMember'
]) {
	test(`${name} preserves existing snake_case database column names`, () => {
		for (const [property, column] of Object.entries(getColumns(schema[name]))) {
			const expected = property.replace(/[A-Z]/g, (letter) => '_' + letter.toLowerCase());
			assert.equal(column.name, expected, `${name}.${property}`);
		}
	});
}
