import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  ornament?: boolean;
}

export function Divider({ className, ornament = false }: DividerProps) {
  if (ornament) {
    return (
      <div className={cn('flex items-center justify-center gap-4 py-8', className)}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-gold text-lg leading-none">✦</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return <hr className={cn('border-0 border-t border-border-light my-8', className)} />;
}
