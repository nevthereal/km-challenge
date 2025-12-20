import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';

export default defineRelations(schema, (r) => ({
	inviteCode: {
		club: r.one.club({
			from: r.inviteCode.clubId,
			to: r.club.id
		})
	},

	user: {
		entries: r.many.entry({
			from: r.user.id,
			to: r.entry.userId
		}),
		adminOf: r.many.clubAdmin({
			from: r.user.id,
			to: r.clubAdmin.userId
		}),
		memberOf: r.many.clubMember({
			from: r.user.id,
			to: r.clubMember.userId
		}),
		challenges: r.many.challengeMember({
			from: r.user.id,
			to: r.challengeMember.userId
		}),
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId
		}),
		accounts: r.many.account({
			from: r.user.id,
			to: r.account.userId
		})
	},

	challenge: {
		entries: r.many.entry({
			from: r.challenge.id,
			to: r.entry.challengeId
		}),
		disciplines: r.many.discipline({
			from: r.challenge.id,
			to: r.discipline.challengeId
		}),
		members: r.many.challengeMember({
			from: r.challenge.id,
			to: r.challengeMember.challengeId
		}),
		club: r.one.club({
			from: r.challenge.clubId,
			to: r.club.id
		})
	},

	discipline: {
		challenge: r.one.challenge({
			from: r.discipline.challengeId,
			to: r.challenge.id
		}),
		entries: r.many.entry({
			from: r.discipline.id,
			to: r.entry.disciplineId
		})
	},

	entry: {
		user: r.one.user({
			from: r.entry.userId,
			to: r.user.id
		}),
		challenge: r.one.challenge({
			from: r.entry.challengeId,
			to: r.challenge.id
		}),
		discipline: r.one.discipline({
			from: r.entry.disciplineId,
			to: r.discipline.id
		})
	},

	club: {
		challenges: r.many.challenge({
			from: r.club.id,
			to: r.challenge.clubId
		}),
		admins: r.many.clubAdmin({
			from: r.club.id,
			to: r.clubAdmin.clubId
		}),
		codes: r.many.inviteCode({
			from: r.club.id,
			to: r.inviteCode.clubId
		}),
		members: r.many.clubMember({
			from: r.club.id,
			to: r.clubMember.clubId
		})
	},

	clubAdmin: {
		club: r.one.club({
			from: r.clubAdmin.clubId,
			to: r.club.id
		}),
		user: r.one.user({
			from: r.clubAdmin.userId,
			to: r.user.id
		})
	},

	clubMember: {
		club: r.one.club({
			from: r.clubMember.clubId,
			to: r.club.id
		}),
		user: r.one.user({
			from: r.clubMember.userId,
			to: r.user.id
		})
	},

	challengeMember: {
		challenge: r.one.challenge({
			from: r.challengeMember.challengeId,
			to: r.challenge.id
		}),
		user: r.one.user({
			from: r.challengeMember.userId,
			to: r.user.id
		})
	},

	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id
		})
	},

	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id
		})
	}
}));
