import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ru } from '@payloadcms/translations/languages/ru'
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
		theme: 'dark',
		meta: {
			titleSuffix: ' · Wedding Admin',
		},
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [Users, Invites, InviteSessions, InviteAccessLogs],
	// Админка только на русском: единственный поддерживаемый язык + язык по умолчанию.
	i18n: {
		supportedLanguages: { ru },
		fallbackLanguage: 'ru',
	},
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || '',
	cors: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : '*',
	csrf: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [],
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URI || 'http://localhost:3000',
		},
		schemaName: 'payload',
	}),
})
