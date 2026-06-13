import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  ornament?: boolean;
}

export function Divider({ className, ornament = false }: DividerProps) {
  if (ornament) {
    return (
      <div className={cn('flex items-center justify-center py-6', className)}>
        <span className="h-px w-12 bg-ink/40" />
      </div>
    );
  }

  return <hr className={cn('border-0 border-t border-border-light my-8', className)} />;
}
