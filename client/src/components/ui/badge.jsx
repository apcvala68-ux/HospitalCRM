import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  secondary: 'bg-secondary/50 text-secondary-foreground',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-border text-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-primary/10 text-primary',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}
