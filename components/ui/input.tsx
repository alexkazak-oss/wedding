import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, id, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={id}
						className="text-xs uppercase tracking-widest text-ink-muted font-sans"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={id}
					className={cn(
						'w-full border-b border-border bg-transparent px-0 py-2',
						'text-sm text-ink placeholder:text-ink-muted/60',
						'focus:border-ink-light focus:outline-none transition-colors',
						'font-sans',
						error && 'border-rose',
						className,
					)}
					{...props}
				/>
				{error && (
					<p className="text-xs text-rose font-sans">{error}</p>
				)}
			</div>
		)
	},
)

Input.displayName = 'Input'
