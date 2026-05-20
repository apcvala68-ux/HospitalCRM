import { Chip } from '@heroui/react';

const colorMap = {
  default: 'default',
  secondary: 'default',
  destructive: 'danger',
  outline: 'default',
  success: 'success',
  warning: 'warning',
  info: 'primary',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <Chip
      color={colorMap[variant] || 'default'}
      variant="soft"
      className={className}
      {...props}
    />
  );
}
