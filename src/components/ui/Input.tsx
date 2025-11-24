import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  const baseStyles = 'w-full px-4 py-2 font-sans text-neutral-100 bg-background-card/50 backdrop-blur-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary placeholder:text-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

  const stateStyles = error
    ? 'border-accent-red focus:ring-accent-red focus:border-accent-red hover:border-accent-red hover:shadow-lg hover:shadow-accent-red/20'
    : 'border-brand-purple/30 focus:ring-brand-purple focus:border-brand-purple hover:border-brand-purple/60 hover:shadow-lg hover:shadow-brand-purple/20';

  const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-100 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={combinedClassName}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-accent-red flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
