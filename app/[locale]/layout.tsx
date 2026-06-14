import { routing } from '@/lib/i18n/routing'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter, Marck_Script, Monsieur_La_Doulaise } from 'next/font/google'
import { notFound } from 'next/navigation'

import '../globals.css'

export const metadata: Metadata = {
	title: 'Владислава и Александр · 08.09.2026',
	description: 'Мы женимся! Приглашаем Вас на нашу свадьбу 8 сентября 2026',
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	viewportFit: 'cover',
	themeColor: '#F5F1EA',
}

const cormorant = Cormorant_Garamond({
	subsets: ['latin', 'cyrillic'],
	weight: ['300', '400', '500', '600'],
	variable: '--font-serif',
	display: 'swap',
})

const inter = Inter({
	subsets: ['latin', 'cyrillic'],
	weight: ['300', '400', '500'],
	variable: '--font-sans',
	display: 'swap',
})

const marckScript = Marck_Script({
	subsets: ['latin', 'cyrillic'],
	weight: '400',
	variable: '--font-script',
	display: 'swap',
})

const signatureFont = Monsieur_La_Doulaise({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-signature',
	display: 'swap',
})

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params

	if (!hasLocale(routing.locales, locale)) {
		notFound()
	}

	setRequestLocale(locale)

	const messages = await getMessages()

	return (
		<html
			lang={locale}
			className={`${cormorant.variable} ${inter.variable} ${marckScript.variable} ${signatureFont.variable}`}
			data-scroll-behavior="smooth"
		>
			{/* suppressHydrationWarning: расширения браузера (напр. ColorZilla
			    добавляет cz-shortcut-listen) дописывают атрибуты в <body> до
			    гидрации — это не наш рассинхрон, глушим предупреждение. */}
			<body className="min-h-screen antialiased" suppressHydrationWarning>
				<NextIntlClientProvider locale={locale} messages={messages}>
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
