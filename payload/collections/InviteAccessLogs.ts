import type { CollectionConfig } from 'payload'

export const InviteAccessLogs: CollectionConfig = {
	slug: 'invite-access-logs',
	admin: {
		useAsTitle: 'event',
		defaultColumns: ['invite', 'event', 'userAgent', 'createdAt'],
		description: 'Audit trail of who opened / verified',
	},
	access: {
		read: ({ req: { user } }) => Boolean(user),
		create: () => true, // server actions write with overrideAccess
		update: () => false,
		delete: ({ req: { user } }) => Boolean(user),
	},
	fields: [
		{ name: 'invite', type: 'relationship', relationTo: 'invites', required: true },
		{
			name: 'event',
			type: 'select',
			required: true,
			options: [
				{ label: 'opened', value: 'opened' },
				{ label: 'verify_ok', value: 'verify_ok' },
				{ label: 'verify_failed', value: 'verify_failed' },
			],
		},
		{ name: 'userAgent', type: 'text' },
		{ name: 'ip', type: 'text' },
	],
}
