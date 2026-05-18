import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08),0_1px_2px_-1px_rgb(0_0_0_/_0.06)]', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}

// Dashboard-specific card variants (flatter, tighter)
export function DashboardCard({ className, ...props }) {
  return <div className={cn('overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_0_rgb(0_0_0_/_0.06)]', className)} {...props} />;
}

export function DashboardCardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-0.5 p-3.5 pb-1.5', className)} {...props} />;
}

export function DashboardCardTitle({ className, ...props }) {
  return <h3 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground/70 leading-none', className)} {...props} />;
}

export function DashboardCardContent({ className, ...props }) {
  return <div className={cn('p-3.5 pt-0', className)} {...props} />;
}
