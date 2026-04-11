import { cn } from '@/lib/utils';
import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full border border-border bg-transparent px-3 py-2 rounded-sm',
            'text-sm text-ink placeholder:text-ink-muted/60',
            'focus:border-ink-light focus:outline-none transition-colors',
            'font-sans resize-none min-h-[80px]',
            error && 'border-rose',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose font-sans">{error}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
