import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /**
   * Size of the button
   * - small: 36px height (below 44px touch target, use for desktop-only contexts)
   * - medium: 44px height (meets mobile touch target standard) ✅
   * - large: 52px height (exceeds mobile touch target standard) ✅
   */
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-sans font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-brand-purple text-white hover:bg-brand-purple-dark hover:shadow-xl hover:shadow-brand-purple-glow hover:scale-[1.02] active:scale-[0.98] focus:ring-brand-purple',
    secondary: 'bg-background-card text-neutral-100 hover:bg-background-tertiary hover:shadow-xl hover:shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] focus:ring-brand-purple border border-brand-purple/30 hover:border-brand-purple/60',
    danger: 'bg-accent-red text-white hover:bg-accent-red-dark hover:shadow-xl hover:shadow-accent-red/40 hover:scale-[1.02] active:scale-[0.98] focus:ring-accent-red',
    ghost: 'bg-transparent text-neutral-100 hover:bg-background-card hover:text-neutral-100 hover:shadow-lg hover:shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] focus:ring-brand-purple border border-brand-purple/30 hover:border-brand-purple/60',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[52px]',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
