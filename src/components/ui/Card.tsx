import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'featured';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'standard',
  children,
  header,
  footer,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 backdrop-blur-sm';

  const variantStyles = {
    standard: 'bg-background-card/50 border border-brand-purple/20 shadow-lg shadow-brand-purple/10 hover:shadow-xl hover:shadow-brand-purple/20 hover:border-brand-purple/40 hover:scale-[1.01]',
    featured: 'bg-background-card/70 border border-brand-purple/40 shadow-lg shadow-brand-purple/20 hover:shadow-2xl hover:shadow-brand-purple/40 hover:border-brand-purple/60 hover:scale-[1.01]',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {header && (
        <div className="px-6 py-4 border-b border-brand-purple/20">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-brand-purple/20">
          {footer}
        </div>
      )}
    </div>
  );
};
