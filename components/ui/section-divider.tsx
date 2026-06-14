import { cn } from '@/lib/utils'

interface SectionDividerProps {
	/** Название секции по центру. Если не передано — рисуется просто линия. */
	label?: string
	/** Стили внешнего контейнера (отступы, выравнивание). */
	className?: string
	/** Стили боковых линий. */
	lineClassName?: string
	/** Стили подписи с названием секции. */
	labelClassName?: string
}

/**
 * Разделитель секций: название по центру, по бокам — линии.
 * Все стили вынесены в className-пропсы, чтобы их было удобно править.
 */
export function SectionDivider({
	label,
	className,
	lineClassName,
	labelClassName,
}: SectionDividerProps) {
	// Без названия — обычная декоративная линия.
	if (!label) {
		return (
			<div className={cn('flex items-center justify-center px-6 py-16 sm:px-12', className)}>
				<span className={cn('h-px w-40 bg-ink/30', lineClassName)} />
			</div>
		)
	}

	return (
		<div className={cn('flex items-center gap-4 px-6 py-16 sm:gap-6 sm:px-12', className)}>
			<span className={cn('h-px flex-1 bg-ink/30', lineClassName)} />
			<span
				className={cn(
					'shrink-0 font-sans uppercase text-ink-muted',
					'text-[11px] tracking-[0.3em] sm:text-xs',
					labelClassName,
				)}
			>
				{label}
			</span>
			<span className={cn('h-px flex-1 bg-ink/30', lineClassName)} />
		</div>
	)
}
