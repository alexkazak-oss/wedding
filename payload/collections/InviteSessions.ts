import type { CollectionConfig } from 'payload'

export const InviteSessions: CollectionConfig = {
	slug: 'invite-sessions',
	admin: {
		useAsTitle: 'sessionHash',
		defaultColumns: ['invite', 'userAgent', 'createdAt', 'lastSeenAt'],
		description: 'Per-device cookie sessions',
	},
	access: {
		read: ({ req: { user } }) => Boolean(user),
		create: () => true, // server actions create these with overrideAccess
		update: ({ req: { user } }) => Boolean(user),
		delete: ({ req: { user } }) => Boolean(user),
	},
	fields: [
		{ name: 'invite', type: 'relationship', relationTo: 'invites', required: true },
		{ name: 'sessionHash', type: 'text', required: true, unique: true, index: true },
		{ name: 'userAgent', type: 'text' },
		{ name: 'lastSeenAt', type: 'date' },
	],
}
