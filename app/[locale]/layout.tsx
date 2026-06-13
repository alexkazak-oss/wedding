import { routing } from '@/lib/i18n/routing'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Cormorant_Garamond, Inter, Marck_Script } from 'next/font/google'
import { notFound } from 'next/navigation'

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
		<html lang={locale} className={`${cormorant.variable} ${inter.variable} ${marckScript.variable}`} data-scroll-behavior="smooth">
			<body className="min-h-screen antialiased">
				<NextIntlClientProvider locale={locale} messages={messages}>
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
