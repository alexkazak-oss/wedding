import type {
	CollectionAfterChangeHook,
	CollectionAfterDeleteHook,
	CollectionAfterReadHook,
	CollectionBeforeChangeHook,
	CollectionBeforeDeleteHook,
	CollectionBeforeValidateHook,
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

// Нормализация списка гостей перед валидацией:
//  • удаляем пустые строки (без имени) — «добавленное, но не заполненное» поле уходит;
//  • ленивая миграция старых приглашений (firstName/lastName + партнёр) в список guests,
//    если он ещё пуст, чтобы существующие записи не сломались и считались в отчёте.
type GuestRow = { firstName?: unknown; lastName?: unknown }

const normalizeGuests: CollectionBeforeValidateHook = ({ data }) => {
	if (!data) return data

	const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

	let guests: Array<{ firstName: string; lastName?: string }> = (
		Array.isArray(data.guests) ? (data.guests as GuestRow[]) : []
	)
		.map((g) => ({ firstName: trim(g?.firstName), lastName: trim(g?.lastName) || undefined }))
		.filter((g) => g.firstName !== '')

	if (guests.length === 0 && trim(data.firstName) !== '') {
		guests = [{ firstName: trim(data.firstName), lastName: trim(data.lastName) || undefined }]
		if (trim(data.partnerFirstName) !== '') {
			guests.push({
				firstName: trim(data.partnerFirstName),
				lastName: trim(data.partnerLastName) || undefined,
			})
		}
	}

	return { ...data, guests }
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
			'Персональные приглашения',
		components: {
			// Сводный отчёт по гостям над списком приглашений.
			beforeListTable: ['@/components/payload/invites-report#InvitesReport'],
		},
	},
	access: {
		read: ({ req: { user } }) => Boolean(user),
		create: ({ req: { user } }) => Boolean(user),
		update: ({ req: { user } }) => Boolean(user),
		delete: ({ req: { user } }) => Boolean(user),
	},
	hooks: {
		beforeValidate: [normalizeGuests],
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
							label: 'Обращение (Видно на сайте)',
							admin: { description: 'Например: «Дорогой Имя!» или «Дорогие Имя и Имя!»' },
						},
						{
							name: 'displayNames',
							type: 'text',
							required: true,
							label: 'Название приглашения',
							admin: {
								description: 'Как гость отображается в админке',
								// В списке под этим заголовком показываем личности приглашения.
								components: {
									Cell: '@/components/payload/invite-names-cell#InviteNamesCell',
								},
							},
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
					description:
						'Список всех гостей этого приглашения. Имена нужны для проверки, если гость зайдёт со 2-го устройства (узнавание по любому из имён списка). Имя обязательно; пустые строки удаляются при сохранении.',
					fields: [
						{
							name: 'guests',
							type: 'array',
							label: 'Гости',
							labels: { singular: 'Гость', plural: 'Гости' },
							required: true,
							minRows: 1,
							admin: {
								description: 'Добавьте по строке на каждого приглашённого человека.',
							},
							fields: [
								{
									type: 'row',
									fields: [
										{ name: 'firstName', type: 'text', required: true, label: 'Имя', admin: { width: '50%' } },
										{ name: 'lastName', type: 'text', label: 'Фамилия', admin: { width: '50%' } },
									],
								},
							],
						},
						// Старые поля одиночного гостя/партнёра. Скрыты в UI, но сохранены в БД
						// ради обратной совместимости и ленивой миграции в список guests.
						{ name: 'firstName', type: 'text', admin: { hidden: true } },
						{ name: 'lastName', type: 'text', admin: { hidden: true } },
						{ name: 'partnerFirstName', type: 'text', admin: { hidden: true } },
						{ name: 'partnerLastName', type: 'text', admin: { hidden: true } },
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
