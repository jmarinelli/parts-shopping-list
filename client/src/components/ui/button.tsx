import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-zinc-950 font-semibold hover:bg-accent-hover',
  secondary:
    'bg-surface-raised border border-border text-primary hover:bg-surface-hover hover:border-border-strong',
  ghost: 'text-secondary hover:bg-surface-raised hover:text-primary',
  destructive:
    'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'px-3.5 py-1.5 text-[13px]',
  sm: 'px-2.5 py-1 text-xs',
  icon: 'p-1.5',
};

export function Button({
  variant = 'secondary',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-[5px] font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
