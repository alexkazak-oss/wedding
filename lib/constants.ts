import type {Locale} from '@/types'

export const locales: Locale[] = ['ru', 'it']
export const defaultLocale: Locale = 'ru'

export const EVENT_SLUG = 'wedding'

export const WEDDING = {
	bride: 'Владислава',
	groom: 'Александр',
	date: new Date('2026-09-08T15:00:00+03:00'),
	endDate: new Date('2026-09-08T23:00:00+03:00'),
	venue: 'DWOR STAJKI, Вилейский район, д. Стайки 20',
	location: 'Беларусь',
	mapUrl: 'https://maps.google.com/?q=Dwor+Stajki+Вилейский+район+Стайки',
	organizer: {
		name: 'Алеся',
		phone: '+375 29 000-00-00',
		telegram: 'https://t.me/alesya',
		telegramLabel: '@alesya',
	},
	domain: 'kazak-av.site',
} as const
