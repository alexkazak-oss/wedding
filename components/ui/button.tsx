import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
	primary:
		'bg-ink text-cream hover:bg-ink-light transition-colors',
	secondary:
		'bg-cream text-ink border border-border hover:border-ink-muted transition-colors',
	ghost:
		'text-ink-light hover:text-ink hover:bg-cream/50 transition-colors',
	outline:
		'border border-border text-ink hover:border-ink-muted transition-colors',
}

const sizeStyles: Record<ButtonSize, string> = {
	sm: 'px-4 py-1.5 text-xs tracking-wider',
	md: 'px-6 py-2.5 text-sm tracking-wider',
	lg: 'px-8 py-3 text-sm tracking-widest',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				disabled={disabled || loading}
				className={cn(
					'inline-flex items-center justify-center font-sans uppercase',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					'focus-visible:outline-gold focus-visible:outline-offset-2',
					variantStyles[variant],
					sizeStyles[size],
					className,
				)}
				{...props}
			>
				{loading ? (
					<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
				) : (
					children
				)}
			</button>
		)
	},
)

Button.displayName = 'Button'
