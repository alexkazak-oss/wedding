import type {Locale} from '@/types'

export const locales: Locale[] = ['ru', 'it']
export const defaultLocale: Locale = 'ru'

export const EVENT_SLUG = 'wedding'

export const WEDDING = {
	bride: 'Владислава',
	groom: 'Александр',
	dateIso: '2026-09-08T15:00:00+03:00',
	endDateIso: '2026-09-08T23:00:00+03:00',
	venue: 'DWOR STAJKI, Вилейский район, д. Стайки 20',
	location: 'Беларусь',
	mapUrl: 'https://maps.google.com/?q=Dwor+Stajki+Вилейский+район+Стайки',
	organizer: {
		name: 'Алесей',
		phone: '+375 44 781 8283',
		telegram: 'https://t.me/valuyevaa',
		telegramLabel: '@valuyevaa',
		// Телеграм-канал организатора (имя «Алесей» в тексте ведёт сюда).
		channel: 'https://t.me/valuyevaa',
	},
	// Ссылка-приглашение в Telegram-чат для гостей (вставьте URL вида https://t.me/+xxxxx).
	guestChatTelegram: 'https://t.me/+ez6RVezSKBxmZmRi',
	domain: 'kazak-av.site',
} as const
