import { cn } from '@/lib/utils'

interface SectionHeadingProps {
	title: string
	subtitle?: string
	className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
	return (
		<div className={cn('text-center mb-10', className)}>
			<h2 className="font-serif text-2xl md:text-3xl font-light text-ink tracking-wide">
				{title}
			</h2>
			{subtitle && (
				<p className="mt-3 text-sm text-ink-muted font-sans tracking-wide">
					{subtitle}
				</p>
			)}
		</div>
	)
}
