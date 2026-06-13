'use client'

import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Guest } from '@/types'
import { useTranslations } from 'next-intl'

interface AdminShellProps {
	children: React.ReactNode
	guest: Guest
}

export function AdminShell({ children, guest }: AdminShellProps) {
	const t = useTranslations('admin')
	const pathname = usePathname()

	const navItems = [
		{ href: '/dashboard', label: t('dashboard'), icon: '👥' },
		{ href: '/admin', label: 'Приглашения', icon: '✉' },
		{ href: '/content', label: t('content'), icon: '📝' },
		{ href: '/chat', label: t('chat'), icon: '💬' },
	]

	return (
		<div className="min-h-screen bg-linen">
			{/* Top nav */}
			<header className="bg-cream border-b border-border-light">
				<div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/" className="font-serif text-lg text-ink tracking-wide">
							A & A
						</Link>
						<nav className="hidden sm:flex items-center gap-1">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'px-3 py-1.5 text-xs uppercase tracking-widest font-sans rounded-sm transition-colors',
										pathname.startsWith(item.href)
											? 'bg-parchment text-ink'
											: 'text-ink-muted hover:text-ink',
									)}
								>
									<span className="mr-1.5">{item.icon}</span>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					<div className="flex items-center gap-4">
						<LocaleSwitcher />
						<span className="text-xs text-ink-muted font-sans">{guest.name}</span>
					</div>
				</div>

				{/* Mobile nav */}
				<nav className="sm:hidden flex border-t border-border-light">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex-1 text-center py-3 text-xs uppercase tracking-wider font-sans transition-colors',
								pathname.startsWith(item.href)
									? 'bg-parchment text-ink'
									: 'text-ink-muted',
							)}
						>
							<span className="block text-base mb-0.5">{item.icon}</span>
							{item.label}
						</Link>
					))}
				</nav>
			</header>

			{/* Content */}
			<main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
				{children}
			</main>
		</div>
	)
}
