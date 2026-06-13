import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
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

export const Invites: CollectionConfig = {
	slug: 'invites',
	admin: {
		useAsTitle: 'displayNames',
		defaultColumns: ['displayNames', 'locale', 'openedAt', 'rsvpStatus', 'createdAt'],
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
