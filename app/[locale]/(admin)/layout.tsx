import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentGuest } from '@/lib/actions/auth'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	setRequestLocale(locale)

	const guest = await getCurrentGuest()

	if (!guest || guest.role !== 'admin') {
		redirect(`/${locale}/login`)
	}

	return <AdminShell guest={guest}>{children}</AdminShell>
}
