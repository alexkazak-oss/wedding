import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'

import { InviteAccessLogs } from './payload/collections/InviteAccessLogs'
import { InviteSessions } from './payload/collections/InviteSessions'
import { Invites } from './payload/collections/Invites'
import { Users } from './payload/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [Users, Invites, InviteSessions, InviteAccessLogs],
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || '',
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URI || '',
		},
		schemaName: 'payload',
	}),
})
