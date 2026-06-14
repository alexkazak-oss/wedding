import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
		defaultColumns: ['name', 'email', 'role', 'updatedAt'],
		description:
			'Администраторы. Любой авторизованный администратор может пригласить нового — создайте запись через "Create new" и отправьте email/пароль.',
	},
	auth: {
		// Brute-force protection — после N неудач блокируем на lockTime
		maxLoginAttempts: 5,
		lockTime: 10 * 60 * 1000, // 10 минут
		// Сессия — 8 часов; обновляется автоматически
		tokenExpiration: 8 * 60 * 60,
		// httpOnly + secure + sameSite=Lax — защищают от XSS / CSRF
		cookies: {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax',
		},
		// Verification по email можно включить позже когда подключите SMTP
		verify: false,
	},
	access: {
		// Только залогиненные могут читать/создавать/менять/удалять админов
		read: ({ req: { user } }) => Boolean(user),
		create: ({ req: { user } }) => Boolean(user),
		update: ({ req: { user } }) => Boolean(user),
		delete: ({ req: { user } }) => Boolean(user),
		admin: ({ req: { user } }) => Boolean(user),
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			label: 'Имя',
		},
		{
			name: 'role',
			type: 'select',
			required: true,
			defaultValue: 'admin',
			options: [
				{ label: 'Администратор', value: 'admin' },
				{ label: 'Редактор', value: 'editor' },
			],
			admin: { position: 'sidebar' },
		},
		// NB: пароль управляется Payload auth (hash, salt, reset token, login attempts).
		// Не объявляем поле password вручную — оно создаётся auth: { ... } автоматически.
	],
}
