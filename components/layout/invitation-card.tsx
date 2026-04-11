import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface InvitationCardProps {
	children: ReactNode
	className?: string
}

export function InvitationCard({ children, className }: InvitationCardProps) {
	return (
		<div className="min-h-screen flex items-start justify-center bg-linen px-0 sm:px-4 md:px-8 py-0 sm:py-8 md:py-12">
			<div
				className={cn(
					'w-full max-w-[720px]',
					'bg-cream',
					'sm:shadow-[var(--shadow-card)]',
					'sm:rounded-sm',
					'min-h-screen sm:min-h-0',
					className,
				)}
			>
				{children}
			</div>
		</div>
	)
}
