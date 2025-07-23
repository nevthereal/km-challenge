import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

const relations = defineRelations(schema, (r) => ({
	inviteCode: {
		club: r.one.club({
			from: r.inviteCode.clubId,
			to: r.club.id
		})
	},
	user: {
		clubs: r.many.club({
			from: r.user.id.through(r.clubMember.userId),
			to: r.club.id.through(r.clubMember.clubId)
		}),
		adminOf: r.many.club({
			from: r.user.id.through(r.clubAdmin.userId),
			to: r.club.id.through(r.clubAdmin.clubId)
		}),
		entries: r.many.entry(),
		challenges: r.many.challenge({
			from: r.user.id.through(r.challengeMember.userId),
			to: r.challenge.id.through(r.challengeMember.challengeId)
		})
	},
	challenge: {
		members: r.many.user({
			from: r.challenge.id.through(r.challengeMember.challengeId),
			to: r.user.id.through(r.challengeMember.userId)
		}),
		entries: r.many.entry(),
		disciplines: r.many.discipline(),
		club: r.one.club({
			from: r.challenge.id,
			to: r.club.id
		})
	},
	entry: {
		user: r.one.user({
			from: r.entry.id,
			to: r.user.id
		}),
		challenge: r.one.challenge({
			from: r.entry.id,
			to: r.challenge.id
		}),
		discipline: r.one.discipline({
			from: r.entry.id,
			to: r.discipline.id
		})
	},
	discipline: {
		challenge: r.one.challenge({
			from: r.discipline.id,
			to: r.challenge.id
		}),
		entries: r.many.entry()
	},
	club: {
		challenges: r.many.challenge(),
		admins: r.many.clubAdmin(),
		codes: r.many.inviteCode(),
		members: r.many.clubMember()
	}
}));

export default relations;
