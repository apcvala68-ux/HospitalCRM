import { Button as HerouiButton } from '@heroui/react';

const variantMap = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'ghost',
};

const sizeMap = {
  default: 'md',
  sm: 'sm',
  lg: 'lg',
  icon: 'md',
};

export function Button({ onClick, className, variant = 'default', size = 'default', ...props }) {
  return (
    <HerouiButton
      variant={variantMap[variant] || 'primary'}
      size={sizeMap[size] || 'md'}
      isIconOnly={size === 'icon'}
      className={className}
      {...(onClick ? { onPress: onClick } : {})}
      {...props}
    />
  );
}
