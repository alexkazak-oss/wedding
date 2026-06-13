import type { Metadata, Viewport } from 'next'
import './globals.css'

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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return children
}
