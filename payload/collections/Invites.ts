import type {
	CollectionAfterChangeHook,
	CollectionAfterDeleteHook,
	CollectionAfterReadHook,
	CollectionBeforeChangeHook,
	CollectionBeforeDeleteHook,
	CollectionConfig,
} from 'payload'
import { revalidateTag } from 'next/cache'
import { inviteTag } from '@/lib/invite/cache'
import { generateInviteToken, hashToken } from '@/lib/invite/token'

const beforeCreateGenerateToken: CollectionBeforeChangeHook = async ({ data, operation }) => {
	if (operation !== 'create') return data
	if (data.tokenRaw && data.tokenHash) return data

	const token = generateInviteToken()
	return {
		...data,
		tokenRaw: token,
		tokenHash: hashToken(token),
	}
}

// Перед удалением приглашения удаляем связанные сессии и логи.
// Иначе FK ON DELETE SET NULL конфликтует с NOT NULL (invite — required) и удаление падает.
const cleanupRelatedRecords: CollectionBeforeDeleteHook = async ({ id, req }) => {
	await req.payload.delete({
		collection: 'invite-sessions',
		where: { invite: { equals: id } },
		overrideAccess: true,
		req,
	})
	await req.payload.delete({
		collection: 'invite-access-logs',
		where: { invite: { equals: id } },
		overrideAccess: true,
		req,
	})
}

// Поля, влияющие на отрендеренную страницу приглашения. Кэш сбрасываем только
// при их изменении — служебные записи (openedAt/lastSeenAt/frozenSnapshot из
// claimInviteSession) кэш страницы не трогают.
const RENDER_FIELDS = [
	'greeting',
	'displayNames',
	'locale',
	'attending',
	'transport',
	'allergies',
	'alcohol',
	'rsvpStatus',
] as const

// revalidateTag работает только в контексте запроса (server action / route
// handler админки). Локальный API из скриптов/сидов контекста не имеет —
// поэтому глушим возможную ошибку.
function safeRevalidateInvite(tokenHash: unknown) {
	if (typeof tokenHash !== 'string' || !tokenHash) return
	try {
		revalidateTag(inviteTag(tokenHash), 'max')
	} catch {
		// нет request-контекста — игнорируем
	}
}

// Правка приглашения в админке сбрасывает кэш именно этой ссылки.
const revalidateInviteCache: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
	const changed =
		!previousDoc ||
		RENDER_FIELDS.some(
			(f) => JSON.stringify(doc?.[f]) !== JSON.stringify(previousDoc?.[f]),
		)
	if (changed) safeRevalidateInvite(doc?.tokenHash)
	return doc
}

// Удаление приглашения сбрасывает кэш, чтобы страница отдала 404.
const revalidateInviteCacheOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
	safeRevalidateInvite(doc?.tokenHash)
	return doc
}

// Собирает готовую короткую ссылку вида {site}/{locale}/{token} для копирования в админке.
const addInviteUrl: CollectionAfterReadHook = ({ doc }) => {
	if (doc?.tokenRaw && doc?.locale) {
		const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
		doc.inviteUrl = `${site}/${doc.locale}/${doc.tokenRaw}`
	}
	return doc
}

export const Invites: CollectionConfig = {
	slug: 'invites',
	labels: {
		singular: 'Приглашение',
		plural: 'Приглашения',
	},
	admin: {
		useAsTitle: 'displayNames',
		defaultColumns: ['displayNames', 'inviteUrl', 'locale', 'rsvpStatus', 'createdAt'],
		description:
			'Персональные приглашения. На первом открытии данные замораживаются в snapshot.',
	},
	access: {
		read: ({ req: { user } }) => Boolean(user),
		create: ({ req: { user } }) => Boolean(user),
		update: ({ req: { user } }) => Boolean(user),
		delete: ({ req: { user } }) => Boolean(user),
	},
	hooks: {
		beforeChange: [beforeCreateGenerateToken],
		beforeDelete: [cleanupRelatedRecords],
		afterChange: [revalidateInviteCache],
		afterDelete: [revalidateInviteCacheOnDelete],
		afterRead: [addInviteUrl],
	},
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Приглашение',
					fields: [
						{
							name: 'greeting',
							type: 'text',
							required: true,
							label: 'Обращение',
							admin: { description: 'Например: «Дорогой Виктор!» или «Дорогие Алла и Виктор!»' },
						},
						{
							name: 'displayNames',
							type: 'text',
							required: true,
							label: 'Имена для списка',
							admin: { description: 'Как гость отображается в админке' },
						},
						{
							name: 'locale',
							type: 'select',
							required: true,
							defaultValue: 'ru',
							options: [
								{ label: 'Русский', value: 'ru' },
								{ label: 'Italiano', value: 'it' },
							],
						},
						{
							name: 'maxGuests',
							type: 'number',
							required: true,
							defaultValue: 1,
							min: 1,
							max: 20,
							label: 'Сколько гостей в приглашении',
						},
						{
							type: 'row',
							fields: [
								{
									name: 'email',
									type: 'email',
									label: 'E-mail для отправки',
									admin: {
										width: '50%',
										description: 'Куда отправить приглашение (необязательно)',
									},
								},
								{
									name: 'phone',
									type: 'text',
									label: 'Телефон для отправки',
									admin: {
										width: '50%',
										description: 'WhatsApp / Telegram / SMS (необязательно)',
									},
								},
							],
						},
						{
							name: 'inviteUrl',
							type: 'text',
							virtual: true,
							label: 'Ссылка для гостя',
							admin: {
								readOnly: true,
								components: {
									Field: '@/components/payload/copy-invite-link#CopyLinkField',
									Cell: '@/components/payload/copy-invite-link#CopyLinkCell',
								},
							},
						},
					],
				},
				{
					label: 'Личность',
					description: 'Используются для верификации, если гость зайдёт со 2-го устройства',
					fields: [
						{
							type: 'row',
							fields: [
								{ name: 'firstName', type: 'text', required: true, label: 'Имя', admin: { width: '50%' } },
								{ name: 'lastName', type: 'text', label: 'Фамилия', admin: { width: '50%' } },
							],
						},
						{
							type: 'row',
							fields: [
								{ name: 'partnerFirstName', type: 'text', label: 'Имя партнёра', admin: { width: '50%' } },
								{ name: 'partnerLastName', type: 'text', label: 'Фамилия партнёра', admin: { width: '50%' } },
							],
						},
					],
				},
				{
					label: 'Анкета',
					description: 'Ответы гостя из формы на странице приглашения.',
					fields: [
						{
							name: 'attending',
							type: 'select',
							label: '1. Будете присутствовать?',
							options: [
								{ label: 'Конечно — да! Кто-то же должен съесть торт', value: 'yes' },
								{ label: 'Возможно приду', value: 'maybe' },
								{ label: 'Не смогу прийти', value: 'no' },
							],
						},
						{
							name: 'transport',
							type: 'select',
							label: '2. Нужен ли трансфер?',
							options: [
								{ label: 'Да, из г. Борисов', value: 'borisov' },
								{ label: 'Да, из г. Минск', value: 'minsk' },
								{ label: 'Нет', value: 'none' },
							],
						},
						{
							name: 'allergies',
							type: 'textarea',
							label: '3. Пищевая аллергия',
						},
						{
							name: 'alcohol',
							type: 'select',
							hasMany: true,
							label: '4. Предпочитаемый алкоголь (2–3 варианта)',
							options: [
								{ label: 'Игристое вино', value: 'sparkling' },
								{ label: 'Белое вино', value: 'white' },
								{ label: 'Красное вино', value: 'red' },
								{ label: 'Водка', value: 'vodka' },
								{ label: 'Виски', value: 'whisky' },
							],
						},
						{
							name: 'rsvpSubmittedAt',
							type: 'date',
							label: 'Анкета заполнена',
							admin: { readOnly: true, position: 'sidebar' },
						},
					],
				},
				{
					label: 'Статус',
					fields: [
						{
							name: 'rsvpStatus',
							type: 'select',
							defaultValue: 'pending',
							options: [
								{ label: 'Ожидает', value: 'pending' },
								{ label: 'Подтвердил', value: 'accepted' },
								{ label: 'Отказался', value: 'declined' },
							],
						},
						{ name: 'guestCount', type: 'number', defaultValue: 0, label: 'Кол-во гостей (ответ)' },
						{ name: 'comment', type: 'textarea', label: 'Комментарий гостя' },
						{
							name: 'openedAt',
							type: 'date',
							label: 'Первый вход',
							admin: { readOnly: true, position: 'sidebar' },
						},
						{
							name: 'lastSeenAt',
							type: 'date',
							label: 'Последний вход',
							admin: { readOnly: true, position: 'sidebar' },
						},
					],
				},
				{
					label: 'Технические',
					fields: [
						{
							name: 'tokenRaw',
							type: 'text',
							label: 'Raw token (генерируется автоматически)',
							admin: { readOnly: true, description: 'Используется в URL приглашения' },
						},
						{
							name: 'tokenHash',
							type: 'text',
							label: 'Token hash (sha256)',
							unique: true,
							admin: { readOnly: true, hidden: true },
						},
						{
							name: 'frozenSnapshot',
							type: 'json',
							label: 'Снимок данных при первом открытии',
							admin: { readOnly: true },
						},
					],
				},
			],
		},
	],
}
