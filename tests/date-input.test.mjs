import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toUtcDateInputValue, getEntryDefaultDate } from '../src/lib/date-input.ts';

for (const timezone of ['America/Los_Angeles', 'Europe/Zurich', 'Pacific/Auckland']) {
	test(`challenge edit dates and entry limits stay unchanged in ${timezone}`, () => {
		const original = process.env.TZ;
		try {
			process.env.TZ = timezone;
			for (const value of ['2026-06-01', '2026-06-30', '2026-12-31', '2027-01-01']) {
				const stored = new Date(value);
				const input = toUtcDateInputValue(stored);
				assert.equal(input, value);
				assert.equal(
					new Date(input).getTime(),
					stored.getTime(),
					'name-only edits retain both date boundaries'
				);
			}
			const localToday = new Date(2026, 5, 15, 23, 30);
			assert.equal(getEntryDefaultDate('2026-06-01', '2026-06-30', localToday), '2026-06-15');
			assert.equal(
				getEntryDefaultDate('2026-06-01', '2026-06-30', new Date(2026, 4, 31, 23)),
				'2026-06-01'
			);
			assert.equal(
				getEntryDefaultDate('2026-06-01', '2026-06-30', new Date(2026, 5, 30, 23)),
				'2026-06-30'
			);
			assert.equal(
				getEntryDefaultDate('2026-06-01', '2026-06-30', new Date(2026, 6, 1)),
				'2026-06-30'
			);
		} finally {
			if (original === undefined) delete process.env.TZ;
			else process.env.TZ = original;
		}
	});
}
