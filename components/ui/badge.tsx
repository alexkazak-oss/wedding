import { cn } from '@/lib/utils'
import type { RsvpStatus } from '@/types'

const statusConfig: Record<RsvpStatus, { label: string; className: string }> = {
	pending: {
		label: '?',
		className: 'bg-parchment text-ink-muted border-border',
	},
	accepted: {
		label: '✓',
		className: 'bg-sage/10 text-sage border-sage/30',
	},
	declined: {
		label: '✗',
		className: 'bg-rose/10 text-rose border-rose/30',
	},
}

interface BadgeProps {
	status: RsvpStatus
	className?: string
}

export function Badge({ status, className }: BadgeProps) {
	const config = statusConfig[status]
	return (
		<span
			className={cn(
				'inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-sans',
				config.className,
				className,
			)}
		>
			{config.label}
		</span>
	)
}
