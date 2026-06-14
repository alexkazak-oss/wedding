import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { ReactNode } from 'react'

interface InvitationCardProps {
	children: ReactNode
	className?: string
}

const UZOR = '/images/classic-border-set/uzor.png'

// unoptimized: отдаём исходный прозрачный PNG напрямую — оптимизатор Next
// сплющивает альфа-канал (узор появлялся бы с фоном).
function Corner({ className }: { className: string }) {
	return (
		<Image
			src={UZOR}
			alt=""
			aria-hidden
			width={1254}
			height={1254}
			unoptimized
			priority
			className={cn(
				'pointer-events-none select-none absolute z-10 w-20 sm:w-28 md:w-28 h-auto',
				className,
			)}
		/>
	)
}

export function InvitationCard({ children, className }: InvitationCardProps) {
	return (
		<div className="min-h-screen flex items-start justify-center bg-linen px-0 sm:px-4 md:px-8 py-0 sm:py-8 md:py-12">
			<div
				className={cn(
					'relative',
					'w-full max-w-180',
					'bg-cream',
					'sm:shadow-[(--shadow-card)]',
					'sm:rounded-sm',
					'min-h-screen sm:min-h-0',
					'overflow-hidden',
					className,
				)}
			>
				{/* Узор в 4 углах карточки */}
				<Corner className="top-0 left-0" />
				<Corner className="top-0 right-0 -scale-x-100" />
				<Corner className="bottom-0 left-0 -scale-y-100" />
				<Corner className="bottom-0 right-0 -scale-100" />

				{children}
			</div>
		</div>
	)
}
