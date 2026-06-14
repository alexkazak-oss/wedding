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

const connectionString = process.env.DATABASE_URI
if (!connectionString) {
	throw new Error('DATABASE_URI is not set — проверь переменные окружения (в т.ч. Production на Vercel)')
}

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
			connectionString,
			// Serverless (Vercel Fluid Compute): на проде ОБЯЗАТЕЛЬНО transaction-пул
			// Supabase (порт 6543) — соединение возвращается в пул после каждой
			// транзакции, поэтому 500 одновременных сессий мультиплексируются на
			// небольшое число серверных коннектов вместо их исчерпания.
			// Небольшой пул на инстанс: запросы короткие и проиндексированы.
			max: 5,
			// Быстро освобождаем простаивающие соединения и не висим на коннекте.
			idleTimeoutMillis: 30_000,
			connectionTimeoutMillis: 10_000,
			// Защита пула: убиваем зависшие запросы/транзакции, чтобы они не
			// держали соединение и не выстраивали очередь под нагрузкой.
			statement_timeout: 15_000,
			idle_in_transaction_session_timeout: 10_000,
		},
		schemaName: 'payload',
		// Схема ведётся вручную через supabase/schema.sql, поэтому отключаем
		// dev-push: иначе при каждом старте drizzle-kit интроспектит удалённую
		// Supabase по сети («Pulling schema from database…») — очень медленно.
		// Чтобы временно включить авто-push, выставь PAYLOAD_DEV_PUSH=true.
		push: process.env.PAYLOAD_DEV_PUSH === 'true',
	}),
})
