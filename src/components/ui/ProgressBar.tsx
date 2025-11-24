import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current value (e.g., current health)
   */
  value: number;
  
  /**
   * Maximum value (e.g., max health)
   */
  max: number;
  
  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Show percentage label
   */
  showLabel?: boolean;
  
  /**
   * Custom label text (overrides percentage)
   */
  label?: string;
  
  /**
   * Color variant (auto-calculated from percentage if not provided)
   */
  variant?: 'healthy' | 'warning' | 'danger' | 'destroyed';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  size = 'medium',
  showLabel = false,
  label,
  variant,
  className = '',
  ...props
}) => {
  // Calculate percentage
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  
  // Auto-determine variant based on percentage if not provided
  const effectiveVariant = variant || getVariantFromPercentage(percentage);
  
  // Size styles
  const sizeStyles = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };
  
  // Variant colors for the fill
  const variantColors = {
    healthy: 'bg-accent-green shadow-accent-green/50',
    warning: 'bg-accent-orange shadow-accent-orange/50',
    danger: 'bg-accent-red shadow-accent-red/50',
    destroyed: 'bg-neutral-600 shadow-neutral-600/50',
  };
  
  // Label text
  const displayLabel = label || `${Math.round(percentage)}%`;
  
  return (
    <div className={`w-full ${className}`} {...props}>
      <div
        className={`relative w-full ${sizeStyles[size]} bg-background-card/50 backdrop-blur-sm border border-brand-purple/20 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel}
      >
        {/* Progress fill */}
        <div
          className={`h-full ${variantColors[effectiveVariant]} shadow-lg transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Glow effect overlay */}
        {percentage > 0 && effectiveVariant !== 'destroyed' && (
          <div
            className={`absolute inset-0 ${variantColors[effectiveVariant]} opacity-30 blur-sm transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      
      {/* Label */}
      {showLabel && (
        <div className="mt-1 text-xs font-mono text-neutral-400 text-center">
          {displayLabel}
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to determine variant from percentage
 * Matches blockade state thresholds from blockade.ts
 */
function getVariantFromPercentage(percentage: number): 'healthy' | 'warning' | 'danger' | 'destroyed' {
  if (percentage >= 75) return 'healthy';   // Intact
  if (percentage >= 50) return 'warning';   // Damaged
  if (percentage >= 25) return 'danger';    // Critical
  return 'destroyed';                       // Destroyed
}
