import { Card as HerouiCard } from '@heroui/react';

export const Card = HerouiCard;
export const CardHeader = HerouiCard.Header;
export const CardTitle = HerouiCard.Title;
export const CardDescription = HerouiCard.Description;
export const CardContent = HerouiCard.Content;
export const CardFooter = HerouiCard.Footer;

export function DashboardCard({ onClick, className, ...props }) {
  return (
    <HerouiCard
      className={`shadow-[var(--shadow-card)] ${className || ''}`}
      {...(onClick ? { onPress: onClick } : {})}
      {...props}
    />
  );
}

export function DashboardCardHeader({ className, ...props }) {
  return (
    <HerouiCard.Header
      className={`pb-1.5 ${className || ''}`}
      {...props}
    />
  );
}

export function DashboardCardTitle({ className, ...props }) {
  return (
    <HerouiCard.Title
      className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none ${className || ''}`}
      {...props}
    />
  );
}

export function DashboardCardContent({ className, ...props }) {
  return (
    <HerouiCard.Content
      className={`pt-0 ${className || ''}`}
      {...props}
    />
  );
}

export { cardVariants } from '@heroui/styles';
