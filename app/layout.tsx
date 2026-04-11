import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Wedding Invitation',
	description: 'You are invited to celebrate with us',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return children
}
